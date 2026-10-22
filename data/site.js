/* =====================================================================
   ORDO 기본 정보 — 이 파일 하나만 고치면 사이트 곳곳이 같이 바뀌어요.

   고칠 때 지킬 것 3가지
   1) 따옴표(" ")와 쉼표(,)는 그대로 두고, 따옴표 안의 글자만 바꿔요.
   2) 줄 맨 앞의 // 뒤에 적힌 글은 설명이라 화면에 안 나와요.
   3) ○○ 표시는 아직 정하지 않은 자리예요. 실제 값으로 바꿔 주세요.

   다 고친 뒤 check.html 을 열어 빨간 표시가 없는지 확인해요.
   ===================================================================== */
window.SITE = {
  // 샘플실 이름: 왼쪽 위 로고, 메뉴, 푸터에 같이 쓰여요.
  // (브라우저 탭 제목과 공유 미리보기 문구는 각 .html 파일 맨 위 <title> 에 따로 있어요)
  name: "ORDO",
  descriptor: "Pattern & Sample Atelier",   // 이름 옆 한 줄 소개(영문)
  city: "Seoul",
  year: "2026",                              // 푸터 © 연도

  // Home 큰 문장(영문만)과 그 아래 한글 한 줄
  // 다른 안: "We make the difficult ones."
  headline: "Structured garments, precisely made.",
  headlineKo: "자켓·코트·셔츠·블라우스, 구조가 어려울수록 정확하게. 패턴부터 샘플까지.",

  // 짧은 영문 소개 3줄(Home·Projects 머리 오른쪽). 한 줄에 한 문장씩.
  intro: [
    "ORDO is a pattern and sample atelier in Seoul,",
    "making jackets, coats, shirts and blouses",
    "for designer brands — from first pattern to final sample."
  ],
  introKo: "디자이너 브랜드의 패턴·토일·샘플을 만드는 서울의 샘플실입니다.",

  careerYears: "○○", // 패턴 경력 연수 (숫자만. 예: "12")

  // 서비스 키워드 한 줄
  keywords: ["Pattern", "Toile", "Sample", "Grading", "Small-batch"],

  // ---------------------------------------------------------------
  // 연락 채널: 비어 있으면 화면에 '이메일 주소'처럼 빈칸 표시가 나와요.
  // 가짜 번호·주소를 넣지 말고, 정해지면 실제 값만 넣어 주세요.
  // ---------------------------------------------------------------
  contact: {
    // 카카오톡 채널 채팅 주소 (예: "https://pf.kakao.com/_abcde/chat")
    // 비어 있으면 모바일 하단 검정 버튼이 [전화 문의]로 바뀌고, 채워 넣으면 자동으로 [카카오톡 문의]가 돼요.
    kakaoUrl: "",
    kakaoId: "",      // 화면에 보일 채널 이름이나 검색용 ID
    instagram: "",    // 인스타그램 아이디 (@ 없이)
    email: "",        // 이메일 주소
    phone: "010-3713-3820"   // 전화번호. 푸터·메뉴·Home·Studio·Contact·하단 바에 같이 쓰여요
  },

  // 주소: Contact 지도·지도 앱 링크, 푸터, Home, Studio 에 같이 쓰여요(바꾸면 지도도 바뀌어요)
  address: "서울 강남구 역삼동 789-19",
  visit: "방문 상담 예약제",
  hours: "평일 10:00–19:00",      // 운영시간
  reply: "보통 영업일 1일 안에 답변드려요",

  // Studio 페이지 요약 박스
  leadTime: "자켓 1벌 기준 상담 → 최종 샘플 약 ○–○주 · 급행은 문의",
  quoteNote: "견적은 아이템 구조·패턴 피스 수·수량으로 정해져요. 도식화를 받으면 1일 안에 안내드려요.",

  // ---------------------------------------------------------------
  // 서비스 5개. id는 영어 그대로 두세요(문의 폼과 연결돼 있어요).
  // days 예: "5–7 DAYS" / min 예: "1벌부터"
  // ---------------------------------------------------------------
  services: [
    { id: "pattern",    no: "01", ko: "패턴 제작",         en: "Pattern making",  chip: "패턴",
      desc: "도식화·샘플·사진을 보고 구조가 맞는 패턴을 설계해요.",
      days: "○–○ DAYS", min: "1벌부터", prepare: "도식화 또는 레퍼런스 사진, 기준 사이즈" },
    { id: "toile",      no: "02", ko: "토일 가봉·핏 수정", en: "Toile & fitting", chip: "토일",
      desc: "광목으로 토일을 만들어 피팅하고, 수정한 핏을 패턴에 반영해요.",
      days: "○–○ DAYS", min: "1벌부터", prepare: "패턴 또는 도식화, 피팅 모델 또는 기준 치수" },
    { id: "sample",     no: "03", ko: "샘플 제작",         en: "Sample making",   chip: "샘플",
      desc: "실원단으로 봉제·마감까지 끝낸 샘플을 만들어요.",
      days: "○–○ DAYS", min: "1벌부터", prepare: "원단·부자재(없으면 함께 찾아요), 확정 패턴" },
    { id: "grading",    no: "04", ko: "그레이딩",          en: "Grading",         chip: "그레이딩",
      desc: "확정된 패턴을 사이즈별로 편차 전개해요.",
      days: "○–○ DAYS", min: "○사이즈부터", prepare: "확정 패턴, 사이즈 편차표(없으면 함께 정해요)" },
    { id: "production", no: "05", ko: "소량생산 연결",      en: "Small-batch",     chip: "소량생산",
      desc: "샘플과 같은 품질로 만들 수 있는 공장을 연결하고 진행을 챙겨요.",
      days: "기간 협의", min: "○○벌부터", prepare: "최종 샘플, 그레이딩 패턴, 수량표" }
  ],

  // 진행 5단계 (check = 고객이 확인하거나 참석하는 시점)
  process: [
    { no: "01", ko: "상담·자료 검토",      en: "Consultation", days: "○ DAYS",   check: "자료 공유" },
    { no: "02", ko: "패턴 설계",          en: "Pattern",      days: "○–○ DAYS", check: "패턴 확인" },
    { no: "03", ko: "토일 가봉·피팅",      en: "Toile",        days: "○–○ DAYS", check: "피팅 참석" },
    { no: "04", ko: "실원단 샘플",        en: "Sample",       days: "○–○ DAYS", check: "샘플 확인" },
    { no: "05", ko: "최종 패턴·샘플 전달", en: "Delivery",     days: "○ DAY",    check: "수령" }
  ],

  // 아이템별 구조 키워드 [한글, 영문]
  construction: [
    { title: "Jacket", ko: "자켓", words: [["하프 캔버스", "Half canvas"], ["투피스 소매 이즈", "Two-piece sleeve ease"], ["라펠 롤", "Lapel roll"], ["슬리브 헤드", "Sleeve head"], ["웰트 포켓", "Welt pocket"]] },
    { title: "Coat",   ko: "코트", words: [["더블페이스 마감", "Double-faced finish"], ["래글런 소매", "Raglan sleeve"], ["바운드 버튼홀", "Bound buttonhole"], ["안감 여유 주름", "Lining jump pleat"], ["칼라 스탠드", "Collar stand"]] },
    { title: "Shirt",  ko: "셔츠", words: [["분할 요크", "Split yoke"], ["칼라 스탠드", "Collar stand"], ["소매 플라켓", "Sleeve placket"], ["사이드 거셋", "Side gusset"], ["쌈솔", "Flat-felled seam"]] },
    { title: "Blouse", ko: "블라우스", words: [["바이어스 재단", "Bias cut"], ["프렌치 심", "French seam"], ["핀턱", "Pin tucks"], ["롤 헴", "Rolled hem"], ["드레이프 넥", "Draped neck"]] }
  ],

  // Studio 페이지: 대표 경력·장비
  career: [
    { year: "20○○–20○○", text: "○○ 패턴실 · 테일러링 자켓·코트 패턴" },
    { year: "20○○–20○○", text: "○○ 브랜드 샘플실 · 셔츠·블라우스 샘플" },
    { year: "2026",      text: "ORDO 오픈" }
  ],
  equipment: ["본봉 미싱 ○대", "오버록 ○대", "인타 미싱", "단추구멍 미싱", "스팀 프레스", "재단대 ○m"],
  // 함께한 브랜드: 공개 허락받은 곳만. 비워 두면 이 줄이 통째로 숨어요. 예: ["Brand A", "Brand B"]
  brands: [],

  // 푸터 사업자 정보 — ○ 표시가 남아 있거나 "" 로 비우면 화면에 안 나와요
  business: "상호 ○○○○ · 대표 ○○○ · 사업자등록번호 ○○○-○○-○○○○○"
};
