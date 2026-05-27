/**
 * 스타벅스 탱크데이 사태 모니터링 데이터 (2026-05-11 ~ 2026-05-27)
 * 본 데이터는 실제 발표된 지표(주가, 결제액 등)와 뉴스 보도를 기반으로 재구성한 시뮬레이션 데이터입니다.
 */

const DASHBOARD_DATA = {
  // 타임라인 마일스톤 이벤트
  milestones: [
    {
      date: '2026-05-18',
      title: '탱크데이 이벤트 런칭 및 논란 발생',
      desc: '5·18 민주화운동 기념일에 맞춰 진행된 "탱크 텀블러" 할인 행사와 "책상에 탁!" 문구가 결합되며 모욕 논란 및 불매 운동이 촉발되었습니다.',
      severity: 'high',
      icon: '🚨'
    },
    {
      date: '2026-05-19',
      title: '여론 폭발 및 이마트 주가 5.4% 급락',
      desc: 'SNS 상의 #스타벅스불매 해시태그 확산 및 언론 보도 급증. 모회사 이마트 주가가 하루 만에 5.4% 폭락하여 시장 충격이 시각화되었습니다.',
      severity: 'high',
      icon: '📉'
    },
    {
      date: '2026-05-20',
      title: '정용진 회장 대국민 공식 사과',
      desc: '신세계그룹 정용진 회장이 경솔한 마케팅에 대해 직접 사과문을 발표했습니다. 경찰이 모욕 혐의 등에 대해 수사에 착수했다는 보도가 나왔습니다.',
      severity: 'medium',
      icon: '✉️'
    },
    {
      date: '2026-05-22',
      title: '손정현 스타벅스코리아 대표 경질',
      desc: '위기 관리 실패와 브랜드 이미지 실추에 대한 책임을 물어 손정현 대표이사가 전격 해임 조치되었습니다.',
      severity: 'medium',
      icon: '👥'
    },
    {
      date: '2026-05-25',
      title: '진상조사 발표 및 기프티콘 이탈 심화',
      desc: '신세계그룹이 진상조사 결과와 재발방지책을 발표했으나, 주요 정부 부처 및 공공기관 등 B2B 채널에서 스타벅스 모바일 상품권 지급 중단이 잇따랐습니다.',
      severity: 'low',
      icon: '🏛️'
    }
  ],

  // 일별 모니터링 데이터
  dailyMetrics: [
    {
      date: '2026-05-11',
      emartStock: 99200,
      emartVolume: 85000,
      salesMobil: 50.2, // 억원 (추정 일평균)
      salesAicel: 51.5, // 억원 (추정 일평균)
      appDownloads: 6920,
      appWau: 390.3, // 만명
      searchTrend: 4.5, // 네이버 트렌드 상대치
      mentions: 1200, // SNS 언급량 (건)
      sentimentPositive: 88, // %
      sentimentNegative: 12, // %
      giftDiscount: 5.1 // % (상품권 중고거래 할인율)
    },
    {
      date: '2026-05-12',
      emartStock: 98800,
      emartVolume: 79000,
      salesMobil: 49.8,
      salesAicel: 50.9,
      appDownloads: 6810,
      appWau: 390.8,
      searchTrend: 4.2,
      mentions: 1150,
      sentimentPositive: 89,
      sentimentNegative: 11,
      giftDiscount: 5.0
    },
    {
      date: '2026-05-13',
      emartStock: 99100,
      emartVolume: 65000,
      salesMobil: 51.1,
      salesAicel: 52.3,
      appDownloads: 7040,
      appWau: 391.2,
      searchTrend: 4.8,
      mentions: 1300,
      sentimentPositive: 87,
      sentimentNegative: 13,
      giftDiscount: 5.2
    },
    {
      date: '2026-05-14',
      emartStock: 98500,
      emartVolume: 71000,
      salesMobil: 50.5,
      salesAicel: 51.0,
      appDownloads: 6990,
      appWau: 390.5,
      searchTrend: 4.6,
      mentions: 1280,
      sentimentPositive: 86,
      sentimentNegative: 14,
      giftDiscount: 5.3
    },
    {
      date: '2026-05-15',
      emartStock: 98900,
      emartVolume: 82000,
      salesMobil: 52.0,
      salesAicel: 53.1,
      appDownloads: 7200,
      appWau: 391.9,
      searchTrend: 5.1,
      mentions: 1420,
      sentimentPositive: 88,
      sentimentNegative: 12,
      giftDiscount: 5.1
    },
    {
      date: '2026-05-16',
      emartStock: 98900, // 토요일 (주가 변동 없음)
      emartVolume: 0,
      salesMobil: 54.8,
      salesAicel: 55.2,
      appDownloads: 7500,
      appWau: 392.5,
      searchTrend: 6.0,
      mentions: 1600,
      sentimentPositive: 90,
      sentimentNegative: 10,
      giftDiscount: 5.0
    },
    {
      date: '2026-05-17',
      emartStock: 98900, // 일요일
      emartVolume: 0,
      salesMobil: 53.2,
      salesAicel: 54.0,
      appDownloads: 7120,
      appWau: 390.3,
      searchTrend: 5.5,
      mentions: 1510,
      sentimentPositive: 87,
      sentimentNegative: 13,
      giftDiscount: 5.2
    },
    {
      date: '2026-05-18', // D-DAY: 사태 발생
      emartStock: 98000, // 월요일 장마감 직전 일부 반영
      emartVolume: 185000,
      salesMobil: 45.1, // 당일 매출 소폭 하락
      salesAicel: 47.2,
      appDownloads: 5280, // 신규설치 둔화 시작
      appWau: 393.1, // 이슈 확인용 유입으로 소폭 상승
      searchTrend: 85.2, // 폭발적인 검색량 상승
      mentions: 18500, // 여론 폭발
      sentimentPositive: 42,
      sentimentNegative: 58,
      giftDiscount: 6.5
    },
    {
      date: '2026-05-19', // 주가 폭락
      emartStock: 92700, // 5.4% 급락
      emartVolume: 495000, // 거래량 대폭발
      salesMobil: 37.8, // 불매 영향 가시화
      salesAicel: 41.5,
      appDownloads: 4120,
      appWau: 398.5, // 사외 이슈 확인 및 환불 조회로 WAU 상승
      searchTrend: 100.0, // 검색 피크
      mentions: 48900, // SNS 최고조
      sentimentPositive: 15,
      sentimentNegative: 85,
      giftDiscount: 8.8 // 상품권 투매 시작
    },
    {
      date: '2026-05-20', // 사과 및 경찰 수사
      emartStock: 88500, // 추가 폭락 (사건 전비 10.8% 하락)
      emartVolume: 512000,
      salesMobil: 33.5,
      salesAicel: 37.2,
      appDownloads: 3510,
      appWau: 402.1,
      searchTrend: 95.5,
      mentions: 52000,
      sentimentPositive: 10,
      sentimentNegative: 90,
      giftDiscount: 11.2 // 10% 돌파
    },
    {
      date: '2026-05-21',
      emartStock: 87000, // 연중 최저치
      emartVolume: 320000,
      salesMobil: 32.1, // 매출 저점 통과
      salesAicel: 35.8,
      appDownloads: 3240,
      appWau: 405.8,
      searchTrend: 88.0,
      mentions: 41200,
      sentimentPositive: 12,
      sentimentNegative: 88,
      giftDiscount: 12.0
    },
    {
      date: '2026-05-22', // 대표이사 해임 발표
      emartStock: 88200, // 소폭 반등 (구조조정 기대감)
      emartVolume: 285000,
      salesMobil: 33.8,
      salesAicel: 36.5,
      appDownloads: 3450,
      appWau: 408.5, // WAU 최고점 (환불 절차 및 사과/대표교체 확인)
      searchTrend: 80.4,
      mentions: 35600,
      sentimentPositive: 18,
      sentimentNegative: 82,
      giftDiscount: 11.5
    },
    {
      date: '2026-05-23', // 토요일
      emartStock: 88200,
      emartVolume: 0,
      salesMobil: 35.2,
      salesAicel: 38.0,
      appDownloads: 3610,
      appWau: 406.2,
      searchTrend: 62.1,
      mentions: 24100,
      sentimentPositive: 20,
      sentimentNegative: 80,
      giftDiscount: 10.8
    },
    {
      date: '2026-05-24', // 일요일 (주간 마무리)
      emartStock: 88200,
      emartVolume: 0,
      salesMobil: 34.0, // 주간 결제추정 모바일인덱스 236.9억 달성 완료 (일별 누적합계 기준)
      salesAicel: 36.8, // 한경에이셀 주간 261억 달성
      appDownloads: 3380,
      appWau: 403.4,
      searchTrend: 55.4,
      mentions: 19800,
      sentimentPositive: 22,
      sentimentNegative: 78,
      giftDiscount: 11.0
    },
    {
      date: '2026-05-25', // B2B 탈퇴 확산
      emartStock: 87800,
      emartVolume: 165000,
      salesMobil: 32.8,
      salesAicel: 35.1,
      appDownloads: 3120, // 설치수 최저치
      appWau: 395.2, // WAU 꺾임 시작 (이탈 완료)
      searchTrend: 65.8,
      mentions: 28500, // B2B 탈퇴 이슈로 언급량 소폭 반등
      sentimentPositive: 16,
      sentimentNegative: 84,
      giftDiscount: 11.5
    },
    {
      date: '2026-05-26',
      emartStock: 88900,
      emartVolume: 142000,
      salesMobil: 33.9,
      salesAicel: 36.2,
      appDownloads: 3350,
      appWau: 389.0,
      searchTrend: 48.2,
      mentions: 17200,
      sentimentPositive: 25,
      sentimentNegative: 75,
      giftDiscount: 10.5
    },
    {
      date: '2026-05-27', // 오늘 (5/27 16시 기준 추정)
      emartStock: 89900, // 조금씩 반등
      emartVolume: 125000,
      salesMobil: 35.5,
      salesAicel: 37.8,
      appDownloads: 3680,
      appWau: 384.5,
      searchTrend: 35.1,
      mentions: 11200,
      sentimentPositive: 29,
      sentimentNegative: 71,
      giftDiscount: 9.8
    }
  ],

  // 경쟁사 동기간 비교 데이터 (주간 기준 - 5/18~24일 기준 전주 대비)
  competitorData: {
    brands: ['스타벅스', '메가커피', '투썸플레이스', '컴포즈커피', '이디야커피'],
    salesChange: [-26.3, 14.5, 11.2, 9.8, 6.5], // % 변동 (스타벅스 이탈 수요 유입 반영)
    marketSharePre: [48.5, 18.2, 14.8, 10.5, 8.0], // 사태 전 %
    marketSharePost: [38.2, 22.8, 17.5, 12.3, 9.2] // 사태 후 %
  },

  // 과거 주요 사태 벤치마크 모델 (브랜드 가치 및 매출 회복 곡선)
  benchmarks: {
    timelineWeeks: [0, 1, 2, 4, 8, 12, 26, 52],
    uniqlomodel: [100, 45, 38, 42, 50, 62, 78, 92], // 2019 불매운동 매출 지수 (사태 전 100 기준)
    carrybagmodel: [100, 85, 78, 80, 89, 94, 98, 100], // 2022 스타벅스 캐리백 발암물질 사태
    currentStarbucks: [100, 73.7, 72.8] // 현재 사태 (0주, 1주, 2주 진행중)
  }
};
