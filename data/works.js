/* =====================================================================
   작업물 목록 (Projects · Portfolio · Work · 작업 상세 · Home 이 모두 이 파일을 읽어요)

   !! 예시 데이터 — 실제 작업으로 바꿔주세요 !!
   아래 12개는 화면 모양을 보려고 넣은 가짜 작업이에요.
   실제 작업을 넣을 때 예시 블록을 지우거나 바꿔 주세요.
   !! 예시 사진 포함 — images/works/ 안의 사진도 화면 확인용 예시예요.
      배포(공개) 전에 실제 작업 사진으로 바꾸거나 지워 주세요. 그대로 두면 ORDO 의 작업처럼 보여요 !!

   ---------------------------------------------------------------------
   새 작업을 넣는 법
   1) 아래 [복사용 예시 블록]의 { 부터 }, 까지 복사해요.
   2) 목록 맨 위(window.WORKS = [ 바로 다음 줄)에 붙여넣어요.
   3) 따옴표 안의 값만 바꿔요. 따옴표와 쉼표는 그대로 둬요.

   [복사용 예시 블록]
   {
     id: "coat-13",                  // 영어 소문자·숫자·- 만. 사진 폴더 이름과 똑같이
     category: "coat",               // jacket / coat / shirt / blouse 중 하나
     title: "Double-faced Wool Coat", // 영문 제목
     titleKo: "더블페이스 울 코트",     // 한글 제목
     year: "2026 FW",
     summary: "한 줄 설명",
     look:    ["01.jpg", "02.jpg", "03.jpg"], // 앞 · 뒤 · 옆 (기본 세로 4:5)
     detail:  ["d1.jpg", "d2.jpg"],           // 디테일 (기본 정사각 1:1)
     inside:  ["in1.jpg"],                    // 안감·심지·시접 (기본 세로 4:5)
     pattern: [],                             // 패턴지·토일 (기본 가로 3:2), 없으면 []
     points: [
       { name: "바운드 버튼홀 / Bound buttonhole", text: "설명 한두 줄", img: "d1.jpg", home: true }
     ],
     fabric: "Wool 90 / Cashmere 10",
     pieces: 38,          // 패턴 피스 수 (숫자)
     toiles: 2,           // 토일 횟수 (숫자)
     days: "12일",        // 제작 기간
     scope: "패턴 · 토일 · 샘플",   // 패턴 / 토일 / 샘플 / 그레이딩 / 소량생산 을 · 로 이어요
     client: "",          // 공개 허락을 받은 경우만. 비우면 'Private client'
     featured: false,     // true면 Home 첫 화면 대표 작업에 먼저 나와요
     hidden: false,       // true면 지우지 않고 화면에서만 숨겨요
     focus: "center top"  // 사진을 자를 때 기준 위치 (보통 그대로)
   },

   ---------------------------------------------------------------------
   사진 칸(look · detail · inside · pattern)을 적는 두 가지 방법
   ① 파일 이름만:            "01.jpg"
   ② 비율까지 알려주기:       { src: "02.jpg", ratio: "3:2" }
      - 사진이 아직 없을 때 회색 자리의 모양을 그 비율로 잡아줘요.
      - 사진을 올리면 Work 페이지는 실제 사진 비율로 알아서 다시 배치해요.
      - 쓸 수 있는 비율 예: "4:5" "3:4" "2:3" "1:1" "3:2" "4:3" "16:9"
      - 비율을 안 적으면 기본값: look 4:5 · detail 1:1 · inside 4:5 · pattern 3:2
   한 목록 안에서 ①과 ②를 섞어 써도 돼요.
     예) look: ["01.jpg", { src: "02.jpg", ratio: "2:3" }, "03.jpg"],

   ---------------------------------------------------------------------
   - 꼭 있어야 하는 칸: id · category · title · look
     (빠진 블록은 그 작업만 건너뛰고 나머지는 정상으로 보여요)
   - 나머지는 비우면("" 또는 []) 그 줄이 화면에서 자동으로 숨어요.
   - 사진 위치: images/works/작업id/파일이름   예) images/works/coat-13/01.jpg
   - 목록 순서 = 화면 순서. 맨 위 작업이 (001)번이에요.
   - 파일 이름은 영어 소문자·숫자로(대소문자까지 똑같이). .JPG 와 .jpg 는 다른 파일이에요.
   - 다 고친 뒤 check.html 을 열어 빨간 표시가 없는지 확인해요.
   ===================================================================== */
window.WORKS = [
  {
    id: "coat-12", category: "coat",
    title: "Double-faced Wool Coat", titleKo: "더블페이스 울 코트", year: "2026 FW",
    summary: "시접 없이 두 겹 원단을 갈라 손으로 감침해 마감한 더블페이스 코트.",
    look: ["01.jpg", { src: "02.jpg", ratio: "2:3" }, "03.jpg", "04.jpg"], detail: ["d1.jpg", "d2.jpg", "d3.jpg", "d4.jpg"], inside: ["in1.jpg", "in2.jpg"], pattern: [{ src: "p1.jpg", ratio: "16:9" }],
    points: [
      { name: "더블페이스 갈라 감침 / Hand-felled double-face", text: "두 겹 원단 사이를 갈라 시접을 안으로 접어 넣고 손바느질로 감침했어요. 안팎 어느 쪽도 시접이 보이지 않아요.", img: "d1.jpg", home: true },
      { name: "바운드 버튼홀 / Bound buttonhole", text: "같은 원단으로 입술을 만들어 단추구멍을 감쌌어요. 두꺼운 원단에서도 구멍 모양이 무너지지 않아요.", img: "d2.jpg", home: true },
      { name: "숄 칼라 롤 / Shawl collar roll", text: "칼라 안쪽을 짧게 잡아 목을 따라 자연스럽게 말리도록 패턴을 나눴어요.", img: "d3.jpg" },
      { name: "웰트 포켓 / Welt pocket", text: "두께 차이를 줄이려고 주머니 천을 얇은 원단으로 바꿨어요.", img: "d4.jpg" }
    ],
    fabric: "Wool 90 / Cashmere 10, double-faced", pieces: 38, toiles: 2, days: "14일", scope: "패턴 · 토일 · 샘플",
    client: "", featured: true, hidden: false, focus: "center top"
  },
  {
    id: "jacket-11", category: "jacket",
    title: "Half-canvas Tailored Jacket", titleKo: "하프 캔버스 테일러드 자켓", year: "2026 FW",
    summary: "가슴판에 캔버스를 넣어 라펠이 접히지 않고 둥글게 말리는 싱글 자켓.",
    look: ["01.jpg", "02.jpg", { src: "03.jpg", ratio: "3:4" }], detail: ["d1.jpg", "d2.jpg", "d3.jpg"], inside: ["in1.jpg"], pattern: ["p1.jpg", { src: "p2.jpg", ratio: "1:1" }],
    points: [
      { name: "하프 캔버스 / Half canvas", text: "가슴부터 라펠까지만 모심 캔버스를 패드 스티치로 고정했어요. 접착심보다 가볍고 형태가 오래가요.", img: "d1.jpg", home: true },
      { name: "투피스 소매 이즈 / Two-piece sleeve ease", text: "소매산에 2.5cm 이즈를 나눠 넣어 어깨선이 주름 없이 둥글게 떨어져요.", img: "d2.jpg", home: true },
      { name: "라펠 롤 / Lapel roll", text: "꺾임선을 따라 테이프를 당겨 붙여 라펠이 가슴에 붙도록 잡았어요.", img: "d3.jpg" }
    ],
    fabric: "Wool 100, tropical", pieces: 42, toiles: 2, days: "16일", scope: "패턴 · 토일 · 샘플 · 그레이딩",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "shirt-10", category: "shirt",
    title: "Split-yoke Poplin Shirt", titleKo: "분할 요크 포플린 셔츠", year: "2026 SS",
    summary: "요크를 사선으로 나눠 어깨가 앞으로 쏠리지 않게 잡은 포플린 셔츠.",
    look: ["01.jpg", { src: "02.jpg", ratio: "3:2" }, "03.jpg"], detail: [{ src: "d1.jpg", ratio: "4:5" }, "d2.jpg"], inside: ["in1.jpg"], pattern: [],
    points: [
      { name: "분할 요크 / Split yoke", text: "뒤 요크를 가운데에서 나누고 결 방향을 바꿔 어깨 기울기에 맞췄어요.", img: "d1.jpg", home: true },
      { name: "쌈솔 / Flat-felled seam", text: "옆선과 소매 밑선을 쌈솔로 박아 안쪽에도 시접이 보이지 않아요.", img: "d2.jpg" }
    ],
    fabric: "Cotton 100, 100s poplin", pieces: 18, toiles: 1, days: "7일", scope: "패턴 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "blouse-09", category: "blouse",
    title: "Bias-cut Silk Blouse", titleKo: "바이어스 실크 블라우스", year: "2026 SS",
    summary: "몸판 전체를 바이어스로 재단해 몸을 따라 흐르는 실크 블라우스.",
    look: ["01.jpg", "02.jpg", "03.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: [{ src: "in1.jpg", ratio: "2:3" }], pattern: ["p1.jpg"],
    points: [
      { name: "바이어스 재단 / Bias cut", text: "원단을 이틀 동안 걸어 늘어짐을 빼고 재단했어요. 밑단이 한쪽으로 처지지 않아요.", img: "d1.jpg", home: true },
      { name: "프렌치 심 / French seam", text: "비치는 원단이라 모든 솔기를 두 번 박아 시접을 감췄어요.", img: "d2.jpg", home: true }
    ],
    fabric: "Silk 100, crepe de chine", pieces: 12, toiles: 2, days: "9일", scope: "패턴 · 토일 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "jacket-08", category: "jacket",
    title: "Cropped Boxy Jacket", titleKo: "크롭 박시 자켓", year: "2025 FW",
    summary: "짧은 기장에 어깨를 넓게 잡아도 앞여밈이 벌어지지 않게 설계한 자켓.",
    look: ["01.jpg", "02.jpg", "03.jpg"], detail: ["d1.jpg", { src: "d2.jpg", ratio: "4:3" }], inside: ["in1.jpg"], pattern: [],
    points: [
      { name: "드롭 숄더 / Dropped shoulder", text: "어깨를 4cm 내리고 진동 둘레를 다시 그려 팔을 들어도 몸판이 따라 올라가지 않아요.", img: "d1.jpg" },
      { name: "안단 균형 / Facing balance", text: "안단을 0.3cm 짧게 잡아 앞여밈이 바깥으로 뒤집히지 않아요.", img: "d2.jpg" }
    ],
    fabric: "Wool 70 / Nylon 30, boucle", pieces: 28, toiles: 1, days: "11일", scope: "패턴 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "coat-07", category: "coat",
    title: "Raglan Balmacaan Coat", titleKo: "래글런 발마칸 코트", year: "2025 FW",
    summary: "앞은 래글런, 뒤는 셋인으로 나눈 소매로 어깨를 둥글게 감싸는 발마칸 코트.",
    look: [{ src: "01.jpg", ratio: "2:3" }, "02.jpg", "03.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: ["in1.jpg"], pattern: [{ src: "p1.jpg", ratio: "16:9" }],
    points: [
      { name: "스플릿 래글런 / Split raglan sleeve", text: "앞은 래글런, 뒤는 셋인으로 소매를 나눠 앞모습은 부드럽고 뒤는 각이 서요.", img: "d1.jpg", home: true },
      { name: "칼라 스탠드 / Collar stand", text: "스탠드를 따로 재단해 단추를 끝까지 잠가도 목에 닿지 않아요.", img: "d2.jpg" }
    ],
    fabric: "Wool 100, gabardine", pieces: 34, toiles: 2, days: "13일", scope: "패턴 · 토일 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "shirt-06", category: "shirt",
    title: "Tuxedo Bib Shirt", titleKo: "턱시도 비브 셔츠", year: "2025 FW",
    summary: "가슴판에 핀턱 비브를 덧대고 숨은 단추 여밈으로 마감한 드레스 셔츠.",
    look: ["01.jpg", "02.jpg", "03.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: ["in1.jpg"], pattern: [],
    points: [
      { name: "핀턱 비브 / Pin-tuck bib", text: "3mm 간격 핀턱을 먼저 잡은 뒤 비브를 재단해 줄이 휘지 않아요.", img: "d1.jpg", home: true },
      { name: "히든 플라켓 / Hidden placket", text: "단추를 안쪽 덧단에 달아 겉에서는 단추가 보이지 않아요.", img: "d2.jpg" }
    ],
    fabric: "Cotton 100, broadcloth", pieces: 22, toiles: 1, days: "8일", scope: "패턴 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "blouse-05", category: "blouse",
    title: "Pin-tuck Cotton Blouse", titleKo: "핀턱 코튼 블라우스", year: "2025 SS",
    summary: "앞판 핀턱으로 볼륨을 만들고 소매 끝을 롤 헴으로 마감한 블라우스.",
    look: ["01.jpg", "02.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: [], pattern: [],
    points: [
      { name: "핀턱 볼륨 / Pin-tuck volume", text: "가슴 아래에서 턱을 풀어 주름이 퍼지도록 길이를 하나씩 다르게 잡았어요.", img: "d1.jpg" },
      { name: "롤 헴 / Rolled hem", text: "소매 끝을 2mm 롤 헴으로 말아 가볍게 떨어져요.", img: "d2.jpg" }
    ],
    fabric: "Cotton 100, voile", pieces: 14, toiles: 1, days: "6일", scope: "패턴 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "coat-04", category: "coat",
    title: "Wrap Belted Coat", titleKo: "랩 벨티드 코트", year: "2025 SS",
    summary: "단추 없이 벨트로만 여미는 랩 코트. 앞판이 겹쳐도 두께가 쌓이지 않게 정리했어요.",
    look: ["01.jpg", "02.jpg", "03.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: [{ src: "in1.jpg", ratio: "1:1" }], pattern: [],
    points: [
      { name: "안감 여유 주름 / Lining jump pleat", text: "안감 밑단에 2cm 여유 주름을 넣어 겉감이 당겨 올라가지 않아요.", img: "d1.jpg", home: true },
      { name: "벨트 고리 / Belt loop", text: "고리를 옆선 솔기 안에 같이 박아 넣어 오래 써도 빠지지 않아요.", img: "d2.jpg" }
    ],
    fabric: "Wool 80 / Polyamide 20", pieces: 30, toiles: 1, days: "12일", scope: "패턴 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "jacket-03", category: "jacket",
    title: "Peak-lapel Double-breasted Jacket", titleKo: "피크 라펠 더블 자켓", year: "2024 FW",
    summary: "피크 라펠과 6버튼 더블 여밈의 균형을 토일 두 번으로 맞춘 자켓.",
    look: ["01.jpg", "02.jpg", "03.jpg"], detail: ["d1.jpg", { src: "d2.jpg", ratio: "3:4" }], inside: ["in1.jpg"], pattern: [{ src: "p1.jpg", ratio: "4:3" }],
    points: [
      { name: "피크 라펠 / Peak lapel", text: "라펠 끝 각도를 토일에서 3번 바꿔 어깨선과 같은 방향을 보게 했어요.", img: "d1.jpg" },
      { name: "슬리브 헤드 / Sleeve head", text: "소매산에 슬리브 헤드를 넣어 어깨 끝이 꺼지지 않아요.", img: "d2.jpg", home: true }
    ],
    fabric: "Wool 100, flannel", pieces: 44, toiles: 2, days: "18일", scope: "패턴 · 토일 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "shirt-02", category: "shirt",
    title: "Box-pleat Oversized Shirt", titleKo: "박스 플리츠 오버사이즈 셔츠", year: "2024 FW",
    summary: "뒤판 박스 플리츠로 품을 넉넉하게 두면서 어깨선은 정확하게 맞춘 셔츠.",
    look: ["01.jpg", "02.jpg"], detail: ["d1.jpg", "d2.jpg"], inside: [], pattern: [],
    points: [
      { name: "박스 플리츠 / Box pleat", text: "플리츠 안쪽을 요크에 고정해 입었을 때 주름이 벌어지지 않아요.", img: "d1.jpg" },
      { name: "소매 플라켓 / Sleeve placket", text: "타워 플라켓을 한 장으로 접어 박아 두께가 고르게 나와요.", img: "d2.jpg" }
    ],
    fabric: "Cotton 100, oxford", pieces: 20, toiles: 1, days: "7일", scope: "패턴 · 샘플 · 그레이딩",
    client: "", featured: false, hidden: false, focus: "center top"
  },
  {
    id: "blouse-01", category: "blouse",
    title: "Draped-neck Blouse", titleKo: "드레이프 넥 블라우스", year: "2024 SS",
    summary: "앞판 한 장을 늘려 목둘레 드레이프를 만든 블라우스. 따로 붙인 조각이 없어요.",
    look: ["01.jpg", "02.jpg", { src: "03.jpg", ratio: "16:9" }], detail: ["d1.jpg", "d2.jpg"], inside: ["in1.jpg"], pattern: [],
    points: [
      { name: "드레이프 넥 / Draped neck", text: "앞판을 슬래시 앤 스프레드로 벌려 드레이프 양을 정하고, 결은 바이어스로 돌렸어요.", img: "d1.jpg", home: true },
      { name: "어깨 고정 테이프 / Stay tape", text: "어깨선에 얇은 테이프를 넣어 드레이프 무게에 늘어나지 않게 했어요.", img: "d2.jpg" }
    ],
    fabric: "Viscose 100, satin", pieces: 10, toiles: 2, days: "8일", scope: "패턴 · 토일 · 샘플",
    client: "", featured: false, hidden: false, focus: "center top"
  }
];
