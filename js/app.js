// Global Chart Instances
let charts = {};

// Current Live Time & Date initialization
function updateLiveTime() {
  const now = new Date('2026-05-27T16:51:49+09:00');
  const format = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const el = document.getElementById('current-time-text');
  if (el) el.innerText = format;
}

// Tab Switching System
function switchTab(tabId) {
  // Hide all contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Deactivate all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show target content
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active');
  
  // Find current active button and add class
  const event = window.event;
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  } else {
    // Fallback: search by text or position if direct event isn't passed
    const btns = document.querySelectorAll('.tab-btn');
    if (tabId === 'overview') btns[0].classList.add('active');
    else if (tabId === 'finance') btns[1].classList.add('active');
    else if (tabId === 'app') btns[2].classList.add('active');
    else if (tabId === 'social') btns[3].classList.add('active');
  }

  // Render or resize charts of active tab to prevent rendering issues in hidden elements
  setTimeout(() => {
    if (tabId === 'overview' && charts.overview) charts.overview.windowResizeHandler();
    if (tabId === 'finance') {
      if (charts.stock) charts.stock.windowResizeHandler();
      if (charts.coupon) charts.coupon.windowResizeHandler();
    }
    if (tabId === 'app') {
      if (charts.wau) charts.wau.windowResizeHandler();
      if (charts.downloads) charts.downloads.windowResizeHandler();
    }
    if (tabId === 'social') {
      if (charts.search) charts.search.windowResizeHandler();
      if (charts.sentiment) charts.sentiment.windowResizeHandler();
    }
  }, 100);
}

// Dynamic Timeline Milestone Builder
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // We want to map daily metrics and attach milestones on top
  DASHBOARD_DATA.dailyMetrics.forEach(day => {
    const milestone = DASHBOARD_DATA.milestones.find(m => m.date === day.date);
    
    const node = document.createElement('div');
    node.className = 'timeline-node';
    if (day.date === '2026-05-18') {
      node.classList.add('active');
    }
    
    const isMilestone = !!milestone;
    const dotEmoji = isMilestone ? milestone.icon : '•';
    
    node.innerHTML = `
      <div class="node-dot">${dotEmoji}</div>
      <div class="node-date">${day.date.substring(5)}</div>
      <div class="node-label">${isMilestone ? milestone.title : day.date === '2026-05-27' ? '오늘 (D+9)' : ''}</div>
    `;
    
    node.addEventListener('click', () => {
      // Deactivate all nodes
      document.querySelectorAll('.timeline-node').forEach(n => {
        n.classList.remove('active', 'active-success');
      });
      
      // Activate this node
      node.classList.add(isMilestone && milestone.severity === 'high' ? 'active' : 'active-success');
      
      // Update Callout Panel
      const callout = document.getElementById('active-event-panel');
      if (isMilestone) {
        callout.style.display = 'flex';
        document.getElementById('event-icon').innerText = milestone.icon;
        document.getElementById('event-title').innerText = `[${milestone.date}] ${milestone.title}`;
        document.getElementById('event-desc').innerText = milestone.desc;
        callout.style.borderColor = milestone.severity === 'high' ? 'var(--color-danger)' : 'var(--color-sb-green)';
        callout.style.background = milestone.severity === 'high' ? 'rgba(255, 71, 87, 0.05)' : 'rgba(0, 176, 116, 0.05)';
      } else {
        callout.style.display = 'flex';
        document.getElementById('event-icon').innerText = '📊';
        document.getElementById('event-title').innerText = `[${day.date}] 일반 모니터링 시점`;
        document.getElementById('event-desc').innerText = `이마트 종가: ${day.emartStock.toLocaleString()}원 | 카드결제액: ${((day.salesMobil + day.salesAicel)/2).toFixed(1)}억원 | 다운로드: ${day.appDownloads.toLocaleString()}건 | 긍정률: ${day.sentimentPositive}%`;
        callout.style.borderColor = 'var(--border-color)';
        callout.style.background = 'var(--bg-card)';
      }

      // Add vertical line annotation to charts dynamically
      updateChartsAnnotation(day.date);
    });
    
    container.appendChild(node);
  });
}

// Calculate Brand Recovery Index
function calculateRecovery() {
  const baseline = DASHBOARD_DATA.dailyMetrics.slice(0, 7); // First week (Pre-crisis)
  const current = DASHBOARD_DATA.dailyMetrics[DASHBOARD_DATA.dailyMetrics.length - 1]; // Latest day
  
  // 1. Sales Recovery Rate (Average of both cards)
  const baseSalesMobil = baseline.reduce((sum, d) => sum + d.salesMobil, 0) / baseline.length;
  const baseSalesAicel = baseline.reduce((sum, d) => sum + d.salesAicel, 0) / baseline.length;
  const baseSalesAvg = (baseSalesMobil + baseSalesAicel) / 2;
  const currSalesAvg = (current.salesMobil + current.salesAicel) / 2;
  const salesRecovery = (currSalesAvg / baseSalesAvg) * 100;
  
  // 2. Stock Recovery Rate
  const baseStock = baseline.reduce((sum, d) => sum + d.emartStock, 0) / baseline.length;
  const stockRecovery = (current.emartStock / baseStock) * 100;
  
  // 3. Sentiment Recovery Rate
  const baseSentiment = baseline.reduce((sum, d) => sum + d.sentimentPositive, 0) / baseline.length;
  const sentimentRecovery = (current.sentimentPositive / baseSentiment) * 100;
  
  // Overall Weighted Score (50% Sales, 30% Stock, 20% Sentiment)
  const overallScore = (salesRecovery * 0.5) + (stockRecovery * 0.3) + (sentimentRecovery * 0.2);
  
  // Update HTML elements
  document.getElementById('rec-sales').innerText = `${salesRecovery.toFixed(1)}%`;
  document.getElementById('rec-stock').innerText = `${stockRecovery.toFixed(1)}%`;
  document.getElementById('rec-sentiment').innerText = `${sentimentRecovery.toFixed(1)}%`;
  
  const recRateEl = document.getElementById('recovery-rate');
  recRateEl.innerText = `${overallScore.toFixed(1)}%`;
  
  const statusEl = document.getElementById('recovery-status');
  const circleEl = document.getElementById('recovery-circle');
  
  circleEl.className = 'meter-circle';
  if (overallScore < 70) {
    statusEl.innerText = '위기 경보 (위험 수준)';
    statusEl.style.color = 'var(--color-danger)';
    circleEl.style.borderTopColor = 'var(--color-danger)';
    circleEl.style.borderRightColor = 'var(--color-danger)';
  } else if (overallScore < 85) {
    statusEl.innerText = '주의 상태 (완만한 회복 추이)';
    statusEl.style.color = 'var(--color-warning)';
    circleEl.style.borderTopColor = 'var(--color-warning)';
    circleEl.style.borderRightColor = 'var(--color-warning)';
    circleEl.style.borderBottomColor = 'var(--color-warning)';
  } else {
    statusEl.innerText = '안정화 돌입 (정상 범위 복귀)';
    statusEl.style.color = 'var(--color-sb-green)';
    circleEl.style.borderTopColor = 'var(--color-sb-green)';
    circleEl.style.borderRightColor = 'var(--color-sb-green)';
    circleEl.style.borderBottomColor = 'var(--color-sb-green)';
    circleEl.style.borderLeftColor = 'var(--color-sb-green)';
  }
}

// Render Competitor List
function renderCompetitors() {
  const container = document.getElementById('competitor-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  const data = DASHBOARD_DATA.competitorData;
  
  data.brands.forEach((brand, idx) => {
    const change = data.salesChange[idx];
    const isUp = change >= 0;
    const changeText = isUp ? `+${change}%` : `${change}%`;
    const changeClass = isUp ? 'up' : 'down';
    
    // Scale progress bar width (max absolute change is around 26%)
    const absPercent = Math.min(Math.abs(change) * 3, 100);
    
    const item = document.createElement('div');
    item.className = 'comp-item';
    item.innerHTML = `
      <div class="comp-meta">
        <span class="comp-name">${brand}</span>
        <span class="comp-change ${changeClass}">${changeText}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill ${changeClass}" style="width: ${absPercent}%"></div>
      </div>
    `;
    
    container.appendChild(item);
  });
}

// Helper to get array of single field from dailyMetrics
const getMetricArray = (field) => DASHBOARD_DATA.dailyMetrics.map(d => d[field]);
const getDatesArray = () => DASHBOARD_DATA.dailyMetrics.map(d => d.date);

// Dynamic Annotation Update on all Charts
function updateChartsAnnotation(dateString) {
  const annotationConfig = {
    x: dateString,
    borderColor: '#ff4757',
    borderWidth: 2,
    strokeDashArray: 4,
    label: {
      borderColor: '#ff4757',
      style: {
        color: '#fff',
        background: '#ff4757',
        fontSize: '10px',
        fontWeight: 600
      },
      text: '선택 시점'
    }
  };

  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].clearAnnotations();
      charts[key].addXaxisAnnotation(annotationConfig);
    }
  });
}

// Initialize All ApexCharts
function initCharts() {
  const dates = getDatesArray();
  
  // 1. Overview: Sales & Stock correlation Chart
  const salesAvg = DASHBOARD_DATA.dailyMetrics.map(d => parseFloat(((d.salesMobil + d.salesAicel) / 2).toFixed(2)));
  const stockPrices = getMetricArray('emartStock');
  
  const optionsOverview = {
    chart: {
      type: 'area',
      height: 350,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#00b074', '#1e90ff'],
    stroke: {
      width: [3, 3],
      curve: 'smooth'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    series: [
      {
        name: '카드결제액 평균 (억원)',
        type: 'area',
        data: salesAvg
      },
      {
        name: '이마트 주가 (원)',
        type: 'line',
        data: stockPrices
      }
    ],
    xaxis: {
      categories: dates,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: [
      {
        title: {
          text: '결제액 (억원)',
          style: { color: '#00b074' }
        },
        labels: {
          formatter: (value) => `${value}억`
        }
      },
      {
        opposite: true,
        title: {
          text: '이마트 주가 (원)',
          style: { color: '#1e90ff' }
        },
        labels: {
          formatter: (value) => `${(value / 10000).toFixed(1)}만원`
        }
      }
    ],
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      yaxis: { lines: { show: true } }
    },
    theme: { mode: 'dark' },
    annotations: {
      xaxis: [
        {
          x: '2026-05-18',
          borderColor: '#ff4757',
          strokeDashArray: 4,
          label: {
            borderColor: '#ff4757',
            style: { color: '#fff', background: '#ff4757', fontWeight: 700 },
            text: 'D-Day: 탱크데이 사태'
          }
        }
      ]
    }
  };
  
  charts.overview = new ApexCharts(document.querySelector("#chart-overview"), optionsOverview);
  charts.overview.render();

  // 2. Finance - Stock Chart
  const stockVolume = getMetricArray('emartVolume');
  const optionsStock = {
    chart: {
      type: 'bar',
      height: 280,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#1e90ff', 'rgba(30,144,255,0.2)'],
    series: [
      {
        name: '이마트 주가 (원)',
        type: 'line',
        data: stockPrices
      },
      {
        name: '거래량 (주)',
        type: 'column',
        data: stockVolume
      }
    ],
    stroke: { width: [3, 0] },
    xaxis: { categories: dates },
    yaxis: [
      {
        title: { text: '주가 (원)' },
        labels: { formatter: (value) => `${value.toLocaleString()}` }
      },
      {
        opposite: true,
        title: { text: '거래량 (주)' },
        labels: { formatter: (value) => `${(value / 1000).toFixed(0)}K` }
      }
    ],
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.stock = new ApexCharts(document.querySelector("#chart-finance-stock"), optionsStock);
  charts.stock.render();

  // 3. Finance - Coupon Discount Chart
  const couponDiscount = getMetricArray('giftDiscount');
  const optionsCoupon = {
    chart: {
      type: 'area',
      height: 280,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#ff4757'],
    stroke: { width: 3, curve: 'straight' },
    series: [{
      name: '중고거래 할인율 (%)',
      data: couponDiscount
    }],
    xaxis: { categories: dates },
    yaxis: {
      labels: { formatter: (value) => `${value.toFixed(1)}%` }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.coupon = new ApexCharts(document.querySelector("#chart-finance-coupon"), optionsCoupon);
  charts.coupon.render();

  // 4. App - WAU Chart
  const appWau = getMetricArray('appWau');
  const optionsWau = {
    chart: {
      type: 'line',
      height: 280,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#ffa502'],
    stroke: { width: 3, curve: 'smooth' },
    series: [{
      name: '앱 WAU (만명)',
      data: appWau
    }],
    xaxis: { categories: dates },
    yaxis: {
      labels: { formatter: (value) => `${value.toFixed(1)}만` }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.wau = new ApexCharts(document.querySelector("#chart-app-wau"), optionsWau);
  charts.wau.render();

  // 5. App - Downloads Chart
  const downloads = getMetricArray('appDownloads');
  const optionsDownloads = {
    chart: {
      type: 'bar',
      height: 280,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#00b074'],
    series: [{
      name: '신규 다운로드 건수 (건)',
      data: downloads
    }],
    xaxis: { categories: dates },
    yaxis: {
      labels: { formatter: (value) => `${value.toLocaleString()}` }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.downloads = new ApexCharts(document.querySelector("#chart-app-downloads"), optionsDownloads);
  charts.downloads.render();

  // 6. Social - Search Trend Chart
  const searchTrend = getMetricArray('searchTrend');
  const optionsSearch = {
    chart: {
      type: 'area',
      height: 280,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#1e90ff'],
    stroke: { width: 2 },
    series: [{
      name: '검색량 상대 지수',
      data: searchTrend
    }],
    xaxis: { categories: dates },
    yaxis: { max: 100 },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.search = new ApexCharts(document.querySelector("#chart-social-search"), optionsSearch);
  charts.search.render();

  // 7. Social - Sentiment Stacked Column Chart
  const posSentiment = getMetricArray('sentimentPositive');
  const negSentiment = getMetricArray('sentimentNegative');
  const optionsSentiment = {
    chart: {
      type: 'bar',
      height: 280,
      stacked: true,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false }
    },
    colors: ['#00b074', '#ff4757'],
    series: [
      {
        name: '긍정 여론 (%)',
        data: posSentiment
      },
      {
        name: '부정 여론 (%)',
        data: negSentiment
      }
    ],
    xaxis: { categories: dates },
    yaxis: { max: 100 },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    theme: { mode: 'dark' }
  };
  charts.sentiment = new ApexCharts(document.querySelector("#chart-social-sentiment"), optionsSentiment);
  charts.sentiment.render();
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  updateLiveTime();
  setInterval(updateLiveTime, 60000); // Update every minute
  
  renderTimeline();
  calculateRecovery();
  renderCompetitors();
  
  initCharts();
  
  // Trigger click on 5/18 node to initialize callout with first event
  setTimeout(() => {
    const nodes = document.querySelectorAll('.timeline-node');
    if (nodes && nodes.length > 7) {
      nodes[7].click(); // 5/18 is the 8th node (index 7)
    }
  }, 300);
});

// Real-time Data Refresh and Noise Simulation Logic
function refreshData() {
  const btn = document.getElementById('refresh-button');
  if (!btn || btn.classList.contains('spinning')) return;
  
  // 1. Trigger spinning animation
  btn.classList.add('spinning');
  
  // 2. Update Live Timestamp to current real system time
  const now = new Date();
  const format = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  document.getElementById('current-time-text').innerText = format;
  
  // 3. Inject simulated real-time noise into the latest day's data (2026-05-27)
  const latestIdx = DASHBOARD_DATA.dailyMetrics.length - 1;
  const latestData = DASHBOARD_DATA.dailyMetrics[latestIdx];
  
  // Emart Stock price: random change of -400 to +400 won (steps of 100)
  const stockNoise = (Math.floor(Math.random() * 9) - 4) * 100;
  latestData.emartStock = Math.max(85000, Math.min(105000, latestData.emartStock + stockNoise));
  
  // Sales estimates: random change of -0.3 to +0.3 billion won
  const salesMobilNoise = parseFloat((Math.random() * 0.6 - 0.3).toFixed(2));
  const salesAicelNoise = parseFloat((Math.random() * 0.6 - 0.3).toFixed(2));
  latestData.salesMobil = parseFloat(Math.max(25, latestData.salesMobil + salesMobilNoise).toFixed(2));
  latestData.salesAicel = parseFloat(Math.max(25, latestData.salesAicel + salesAicelNoise).toFixed(2));
  
  // Sentiment: positive ratio moves within 26% to 32%
  const sentimentPos = Math.max(26, Math.min(32, latestData.sentimentPositive + (Math.random() > 0.5 ? 1 : -1)));
  latestData.sentimentPositive = sentimentPos;
  latestData.sentimentNegative = 100 - sentimentPos;
  
  // Search Trend: random change of -1.5 to +1.5
  latestData.searchTrend = parseFloat(Math.max(20, Math.min(60, latestData.searchTrend + (Math.random() * 3 - 1.5))).toFixed(1));
  
  // Gift Card Discount: random change of -0.2% to +0.2%
  latestData.giftDiscount = parseFloat(Math.max(7, Math.min(15, latestData.giftDiscount + (Math.random() * 0.4 - 0.2))).toFixed(1));

  // 4. Update Top KPI Cards
  const avgSales = ((latestData.salesMobil + latestData.salesAicel) / 2).toFixed(1);
  document.getElementById('kpi-sales-value').innerText = `${avgSales}억`;
  document.getElementById('kpi-stock-value').innerText = `${latestData.emartStock.toLocaleString()}원`;
  
  // Sentiment Card: update sentiment values
  document.getElementById('kpi-sentiment-value').innerText = `${latestData.sentimentNegative.toFixed(1)}%`;
  
  // Calculate recovery rate and refresh components
  calculateRecovery();
  
  // 5. Update and animate charts with the new dataset
  setTimeout(() => {
    const dates = getDatesArray();
    const salesAvg = DASHBOARD_DATA.dailyMetrics.map(d => parseFloat(((d.salesMobil + d.salesAicel) / 2).toFixed(2)));
    const stockPrices = getMetricArray('emartStock');
    
    // Overview Chart
    if (charts.overview) {
      charts.overview.updateSeries([
        { name: '카드결제액 평균 (억원)', data: salesAvg },
        { name: '이마트 주가 (원)', data: stockPrices }
      ]);
    }
    
    // Stock Chart
    if (charts.stock) {
      charts.stock.updateSeries([
        { name: '이마트 주가 (원)', data: stockPrices },
        { name: '거래량 (주)', data: getMetricArray('emartVolume') }
      ]);
    }
    
    // Coupon Chart
    if (charts.coupon) {
      charts.coupon.updateSeries([
        { name: '중고거래 할인율 (%)', data: getMetricArray('giftDiscount') }
      ]);
    }
    
    // Social Search Chart
    if (charts.search) {
      charts.search.updateSeries([
        { name: '검색량 상대 지수', data: getMetricArray('searchTrend') }
      ]);
    }
    
    // Social Sentiment Chart
    if (charts.sentiment) {
      charts.sentiment.updateSeries([
        { name: '긍정 여론 (%)', data: getMetricArray('sentimentPositive') },
        { name: '부정 여론 (%)', data: getMetricArray('sentimentNegative') }
      ]);
    }
    
    // Remove spinning class to end loading animation
    btn.classList.remove('spinning');
  }, 800);
}
