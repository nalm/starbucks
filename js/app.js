// Global Chart Instances
let charts = {};

// 5/28부터 현재 날짜까지의 점진적 브랜드 지표 회복 데이터를 동적으로 생성하는 함수
function fillDataToToday() {
  const metrics = DASHBOARD_DATA.dailyMetrics;
  const lastData = metrics[metrics.length - 1];
  const lastDate = new Date(lastData.date);
  const today = new Date();
  
  // 시분초 제외한 순수 날짜 비교
  const lastDateCompare = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const todayCompare = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // 날짜 차이 계산 (일 단위)
  const diffTime = todayCompare - lastDateCompare;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return;
  
  let currentDate = new Date(lastDateCompare);
  
  // 5/27 저점 기준치들
  let emartStock = lastData.emartStock;
  let salesMobil = lastData.salesMobil;
  let salesAicel = lastData.salesAicel;
  let appDownloads = lastData.appDownloads;
  let appWau = lastData.appWau;
  let searchTrend = lastData.searchTrend;
  let mentions = lastData.mentions;
  let sentimentPositive = lastData.sentimentPositive;
  let giftDiscount = lastData.giftDiscount;

  for (let i = 1; i <= diffDays; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // 점진적으로 정상 수치로 회복하는 factor (0.0 ~ 1.0)
    // 21일(3주일)에 걸쳐 완전 회복 상태로 수렴하게 유도
    const factor = Math.min(1.0, i / 21);
    
    // 목표 정상 기준치
    const targetStock = 97000; // 원
    const targetMobil = 51.5; // 억원
    const targetAicel = 52.5; // 억원
    const targetDownloads = 7000; // 건
    const targetWau = 391.0; // 만명
    const targetSearch = 5.0; // 상대지수
    const targetMentions = 1400; // 건
    const targetPos = 88.0; // %
    const targetDiscount = 5.1; // %

    // 보간값에 약간의 일별 노이즈 추가
    const dayStock = Math.round(emartStock + (targetStock - emartStock) * factor + (Math.random() * 1200 - 600));
    const dayMobil = parseFloat((salesMobil + (targetMobil - salesMobil) * factor + (Math.random() * 0.8 - 0.4)).toFixed(2));
    const dayAicel = parseFloat((salesAicel + (targetAicel - salesAicel) * factor + (Math.random() * 0.8 - 0.4)).toFixed(2));
    const dayDownloads = Math.round(appDownloads + (targetDownloads - appDownloads) * factor + (Math.random() * 600 - 300));
    const dayWau = parseFloat((appWau + (targetWau - appWau) * factor + (Math.random() * 2.0 - 1.0)).toFixed(2));
    const daySearch = parseFloat((searchTrend + (targetSearch - searchTrend) * factor + (Math.random() * 1.6 - 0.8)).toFixed(1));
    const dayMentions = Math.round(mentions + (targetMentions - mentions) * factor + (Math.random() * 300 - 150));
    const dayPos = Math.round(sentimentPositive + (targetPos - sentimentPositive) * factor + (Math.random() * 6 - 3));
    const dayNeg = 100 - dayPos;
    const dayDiscount = parseFloat((giftDiscount + (targetDiscount - giftDiscount) * factor + (Math.random() * 0.6 - 0.3)).toFixed(1));

    metrics.push({
      date: dateStr,
      emartStock: dayStock,
      emartVolume: currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 0 : Math.round(120000 + Math.random() * 90000),
      salesMobil: Math.max(25, dayMobil),
      salesAicel: Math.max(25, dayAicel),
      appDownloads: Math.max(1000, dayDownloads),
      appWau: Math.max(300, dayWau),
      searchTrend: Math.max(0, daySearch),
      mentions: Math.max(0, dayMentions),
      sentimentPositive: Math.min(100, Math.max(0, dayPos)),
      sentimentNegative: Math.min(100, Math.max(0, dayNeg)),
      giftDiscount: Math.max(0, dayDiscount)
    });
  }
}

// Current Live Time & Date initialization
function updateLiveTime() {
  const now = new Date();
  const format = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
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
  
  const lastIndex = DASHBOARD_DATA.dailyMetrics.length - 1;
  const lastDateStr = DASHBOARD_DATA.dailyMetrics[lastIndex].date;
  
  // We want to map daily metrics and attach milestones on top
  DASHBOARD_DATA.dailyMetrics.forEach((day, index) => {
    const milestone = DASHBOARD_DATA.milestones.find(m => m.date === day.date);
    
    const node = document.createElement('div');
    node.className = 'timeline-node';
    if (day.date === '2026-05-18') {
      node.classList.add('active');
    }
    
    const isMilestone = !!milestone;
    const dotEmoji = isMilestone ? milestone.icon : '•';
    const isLast = day.date === lastDateStr;
    
    let nodeLabel = '';
    if (isMilestone) {
      nodeLabel = milestone.title;
    } else if (isLast) {
      const start = new Date('2026-05-18');
      const current = new Date(day.date);
      const diff = Math.ceil((current - start) / (1000 * 60 * 60 * 24));
      nodeLabel = `오늘 (D+${diff})`;
    }
    
    node.innerHTML = `
      <div class="node-dot">${dotEmoji}</div>
      <div class="node-date">${day.date.substring(5)}</div>
      <div class="node-label">${nodeLabel}</div>
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
  
  // D-Day 계산 및 업데이트
  const start = new Date('2026-05-18');
  const currDate = new Date(current.date);
  const diffDays = Math.ceil((currDate - start) / (1000 * 60 * 60 * 24));
  const daysEl = document.getElementById('recovery-days');
  if (daysEl) {
    daysEl.innerText = `D+${diffDays} 경과`;
  }
  
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

// Update Top KPI Cards dynamically based on the latest metrics
function updateKpiCards() {
  const metrics = DASHBOARD_DATA.dailyMetrics;
  const current = metrics[metrics.length - 1];
  
  // 7일 전 데이터
  const prevWeekIdx = Math.max(0, metrics.length - 8);
  const prevWeek = metrics[prevWeekIdx];
  
  // 1. 카드결제액 (주간 평균 합계로 표현)
  const currSalesAvg = (current.salesMobil + current.salesAicel) / 2;
  const prevSalesAvg = (prevWeek.salesMobil + prevWeek.salesAicel) / 2;
  const salesChangePercent = ((currSalesAvg - prevSalesAvg) / prevSalesAvg) * 100;
  
  const salesValEl = document.getElementById('kpi-sales-value');
  const salesChangeEl = document.getElementById('kpi-sales-change');
  if (salesValEl && salesChangeEl) {
    salesValEl.innerText = `${(currSalesAvg * 7).toFixed(1)}억`;
    if (salesChangePercent >= 0) {
      salesChangeEl.className = 'kpi-change up';
      salesChangeEl.innerHTML = `<span>▲ ${salesChangePercent.toFixed(1)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(전주 대비)</span>`;
    } else {
      salesChangeEl.className = 'kpi-change down';
      salesChangeEl.innerHTML = `<span>▼ ${Math.abs(salesChangePercent).toFixed(1)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(전주 대비)</span>`;
    }
  }

  // 2. 이마트 주가
  const stockValEl = document.getElementById('kpi-stock-value');
  const stockChangeEl = document.getElementById('kpi-stock-change');
  if (stockValEl && stockChangeEl) {
    stockValEl.innerText = `${current.emartStock.toLocaleString()}원`;
    
    // 사태 직전(5/17) 대비 변동
    const baseStock = 98900;
    const stockChangePercent = ((current.emartStock - baseStock) / baseStock) * 100;
    if (stockChangePercent >= 0) {
      stockChangeEl.className = 'kpi-change up';
      stockChangeEl.innerHTML = `<span>▲ ${stockChangePercent.toFixed(2)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(사태 전 대비)</span>`;
    } else {
      stockChangeEl.className = 'kpi-change down';
      stockChangeEl.innerHTML = `<span>▼ ${Math.abs(stockChangePercent).toFixed(2)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(사태 전 대비)</span>`;
    }
  }

  // 3. 앱 WAU
  const appValEl = document.getElementById('kpi-app-value');
  const appChangeEl = document.getElementById('kpi-app-change');
  if (appValEl && appChangeEl) {
    appValEl.innerText = `${current.appWau.toFixed(1)}만`;
    
    // 사태 직전(5/17) WAU 대비 변동
    const baseWau = 390.3;
    const wauChangePercent = ((current.appWau - baseWau) / baseWau) * 100;
    if (wauChangePercent >= 0) {
      appChangeEl.className = 'kpi-change up';
      appChangeEl.innerHTML = `<span>▲ ${wauChangePercent.toFixed(2)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(사태 전 대비)</span>`;
    } else {
      appChangeEl.className = 'kpi-change down';
      appChangeEl.innerHTML = `<span>▼ ${Math.abs(wauChangePercent).toFixed(2)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(사태 전 대비)</span>`;
    }
  }

  // 4. 부정 여론 지수
  const sentimentValEl = document.getElementById('kpi-sentiment-value');
  const sentimentChangeEl = document.getElementById('kpi-sentiment-change');
  if (sentimentValEl && sentimentChangeEl) {
    sentimentValEl.innerText = `${current.sentimentNegative.toFixed(1)}%`;
    
    // 사태 직전(5/17) 대비 증가량
    const baseNeg = 13;
    const negDiff = current.sentimentNegative - baseNeg;
    if (negDiff >= 0) {
      sentimentChangeEl.className = 'kpi-change down';
      sentimentChangeEl.innerHTML = `<span>▲ ${negDiff.toFixed(1)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(부정 상승)</span>`;
    } else {
      sentimentChangeEl.className = 'kpi-change up';
      sentimentChangeEl.innerHTML = `<span>▼ ${Math.abs(negDiff).toFixed(1)}%</span><span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(부정 감소)</span>`;
    }
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
  fillDataToToday();
  updateLiveTime();
  setInterval(updateLiveTime, 1000); // Update every second
  
  renderTimeline();
  updateKpiCards();
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
  
  // 3. Inject simulated real-time noise into the latest day's data (Today)
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
  
  // Sentiment: positive ratio moves within 75% to 95% (recovered state)
  const sentimentPos = Math.max(75, Math.min(95, latestData.sentimentPositive + (Math.random() > 0.5 ? 1 : -1)));
  latestData.sentimentPositive = sentimentPos;
  latestData.sentimentNegative = 100 - sentimentPos;
  
  // Search Trend: random change of -0.6 to +0.6
  latestData.searchTrend = parseFloat(Math.max(1, Math.min(15, latestData.searchTrend + (Math.random() * 1.2 - 0.6))).toFixed(1));
  
  // Gift Card Discount: random change of -0.2% to +0.2%
  latestData.giftDiscount = parseFloat(Math.max(4, Math.min(8, latestData.giftDiscount + (Math.random() * 0.4 - 0.2))).toFixed(1));

  // 4. Update Top KPI Cards
  updateKpiCards();
  
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
