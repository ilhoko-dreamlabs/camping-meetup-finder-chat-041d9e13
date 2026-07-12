const defaultOrigins = ["서울", "광명", "대전", "하남"];

const candidates = [
  {
    name: "천안시 국민여가캠핑장",
    address: "충남 천안시 동남구 목천읍 교촌7길 46-13",
    region: "천안",
    price: "공공 캠핑장",
    reservation: "available",
    reservationLabel: "공식 조회 기준 7개 사이트 가능",
    reservationDetail: "A19, A24, A28, B1, B2, B4, C1",
    bookingUrl: "https://mccamp.cauc.or.kr/product/",
    mapUrl: "https://map.naver.com/p/search/%EC%B2%9C%EC%95%88%EC%8B%9C%20%EA%B5%AD%EB%AF%BC%EC%97%AC%EA%B0%80%EC%BA%A0%ED%95%91%EC%9E%A5",
    times: { 서울: 95, 광명: 92, 대전: 58, 하남: 86 },
    notes: "수도권 3명과 대전 1명의 이동시간 균형이 가장 좋은 후보입니다.",
  },
  {
    name: "진천 힐사이드캠핑장",
    address: "충북 진천군 문백면 태락3길 5-115",
    region: "진천",
    price: "60,000-80,000원",
    reservation: "unknown",
    reservationLabel: "예약 페이지 확인 필요",
    reservationDetail: "일부 구역 2박 조건 가능성 있음",
    bookingUrl: "https://camfit.co.kr/camp/63520f7c1924b6001f248fd0",
    mapUrl: "https://map.naver.com/p/search/%EC%A7%84%EC%B2%9C%20%ED%9E%90%EC%82%AC%EC%9D%B4%EB%93%9C%EC%BA%A0%ED%95%91%EC%9E%A5",
    times: { 서울: 115, 광명: 105, 대전: 70, 하남: 100 },
    notes: "천안보다 수도권 이동시간은 늘지만 대전과의 균형은 유지됩니다.",
  },
  {
    name: "청주키즈캠핑장",
    address: "충북 청주시 일대",
    region: "청주",
    price: "예약처 확인",
    reservation: "unknown",
    reservationLabel: "실시간 확인 필요",
    reservationDetail: "가족 단위 시설 후보",
    bookingUrl: "https://www.google.com/search?q=%EC%B2%AD%EC%A3%BC+%EC%BA%A0%ED%95%91%EC%9E%A5+%EC%98%88%EC%95%BD",
    mapUrl: "https://map.naver.com/p/search/%EC%B2%AD%EC%A3%BC%20%EC%BA%A0%ED%95%91%EC%9E%A5",
    times: { 서울: 130, 광명: 120, 대전: 55, 하남: 115 },
    notes: "대전 쪽 부담은 낮지만 수도권 출발자는 천안보다 길어집니다.",
  },
  {
    name: "괴산 중부권 캠핑 후보",
    address: "충북 괴산군 일대",
    region: "괴산",
    price: "예약처 확인",
    reservation: "unknown",
    reservationLabel: "실시간 확인 필요",
    reservationDetail: "자연형 캠핑장 다수",
    bookingUrl: "https://www.google.com/search?q=%EA%B4%B4%EC%82%B0+%EC%BA%A0%ED%95%91%EC%9E%A5+%EC%98%88%EC%95%BD",
    mapUrl: "https://map.naver.com/p/search/%EA%B4%B4%EC%82%B0%20%EC%BA%A0%ED%95%91%EC%9E%A5",
    times: { 서울: 145, 광명: 135, 대전: 85, 하남: 125 },
    notes: "자연형 후보는 많지만 이번 조건에서는 수도권 이동시간이 다소 깁니다.",
  },
  {
    name: "공주 북부권 캠핑 후보",
    address: "충남 공주시 일대",
    region: "공주",
    price: "예약처 확인",
    reservation: "unknown",
    reservationLabel: "실시간 확인 필요",
    reservationDetail: "대전 접근성 우수",
    bookingUrl: "https://www.google.com/search?q=%EA%B3%B5%EC%A3%BC+%EC%BA%A0%ED%95%91%EC%9E%A5+%EC%98%88%EC%95%BD",
    mapUrl: "https://map.naver.com/p/search/%EA%B3%B5%EC%A3%BC%20%EC%BA%A0%ED%95%91%EC%9E%A5",
    times: { 서울: 145, 광명: 135, 대전: 45, 하남: 130 },
    notes: "대전 거주자에게 유리하지만 전체 균형 점수는 천안보다 낮습니다.",
  },
];

const state = {
  origins: [...defaultOrigins],
  sort: "balance",
};

const originList = document.querySelector("#originList");
const originTemplate = document.querySelector("#originTemplate");
const results = document.querySelector("#results");
const resultCount = document.querySelector("#resultCount");
const summary = document.querySelector("#summary");
const maxTime = document.querySelector("#maxTime");
const availableOnly = document.querySelector("#availableOnly");

function renderOrigins() {
  originList.replaceChildren();
  state.origins.forEach((origin, index) => {
    const row = originTemplate.content.firstElementChild.cloneNode(true);
    const input = row.querySelector(".origin-input");
    input.value = origin;
    input.placeholder = "예: 수원";
    input.addEventListener("input", () => {
      state.origins[index] = input.value.trim();
      renderResults();
    });
    row.querySelector(".remove-origin").addEventListener("click", () => {
      state.origins.splice(index, 1);
      renderOrigins();
      renderResults();
    });
    originList.append(row);
  });
}

function getKnownOrigins() {
  return state.origins.filter((origin) => origin && candidates.some((candidate) => candidate.times[origin]));
}

function scoreCandidate(candidate, origins) {
  const times = origins.map((origin) => candidate.times[origin]);
  const max = Math.max(...times);
  const min = Math.min(...times);
  const avg = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  const spread = max - min;
  const balanceScore = avg + spread * 0.85;
  return { times, max, min, avg, spread, balanceScore };
}

function getSortedCandidates() {
  const origins = getKnownOrigins();
  const limit = Number(maxTime.value);
  let items = candidates
    .map((candidate) => ({ candidate, metrics: scoreCandidate(candidate, origins) }))
    .filter(({ candidate, metrics }) => origins.length > 0 && metrics.max <= limit)
    .filter(({ candidate }) => !availableOnly.checked || candidate.reservation === "available");

  if (state.sort === "maxTime") {
    items.sort((a, b) => a.metrics.max - b.metrics.max);
  } else if (state.sort === "available") {
    items.sort((a, b) => Number(b.candidate.reservation === "available") - Number(a.candidate.reservation === "available") || a.metrics.balanceScore - b.metrics.balanceScore);
  } else {
    items.sort((a, b) => a.metrics.balanceScore - b.metrics.balanceScore);
  }

  return { origins, items };
}

function statusClass(status) {
  if (status === "available") return "ok";
  if (status === "limited") return "warn";
  return "unknown";
}

function renderResults() {
  const { origins, items } = getSortedCandidates();
  resultCount.textContent = `${items.length}개 후보`;
  summary.textContent = origins.length
    ? `${origins.join(", ")} 기준 이동시간을 비교했습니다. 거리보다 실제 이동시간 균형을 우선합니다.`
    : "지원되는 출발지를 입력하면 결과가 표시됩니다.";

  if (items.length === 0) {
    results.innerHTML = `<div class="empty">조건에 맞는 후보가 없습니다. 최대 이동시간 제한을 넓히거나 예약 필터를 해제하세요.</div>`;
    return;
  }

  results.replaceChildren(
    ...items.map(({ candidate, metrics }, index) => {
      const card = document.createElement("article");
      card.className = "candidate";
      const timeItems = origins
        .map(
          (origin) => `
            <div class="time-item">
              <span>${origin}</span>
              <strong>${candidate.times[origin]}분</strong>
            </div>
          `,
        )
        .join("");

      card.innerHTML = `
        <div class="candidate-header">
          <div>
            <h3>${index + 1}. ${candidate.name}</h3>
            <p>${candidate.address}</p>
          </div>
          <div class="score">
            ${Math.round(metrics.balanceScore)}
            <span>균형 점수</span>
          </div>
        </div>
        <div class="meta-grid">
          <div class="meta-item"><span>지역</span><strong>${candidate.region}</strong></div>
          <div class="meta-item"><span>평균 이동</span><strong>${metrics.avg}분</strong></div>
          <div class="meta-item"><span>최장 이동</span><strong>${metrics.max}분</strong></div>
          <div class="meta-item"><span>편차</span><strong>${metrics.spread}분</strong></div>
        </div>
        <div class="time-grid">${timeItems}</div>
        <div class="status-row">
          <span class="pill ${statusClass(candidate.reservation)}">${candidate.reservationLabel}</span>
          <span class="pill unknown">${candidate.price}</span>
          <span class="pill unknown">${candidate.reservationDetail}</span>
        </div>
        <p>${candidate.notes}</p>
        <div class="actions">
          <a class="primary-link" href="${candidate.bookingUrl}" target="_blank" rel="noreferrer">예약현황 확인</a>
          <a href="${candidate.mapUrl}" target="_blank" rel="noreferrer">지도에서 보기</a>
        </div>
      `;
      return card;
    }),
  );
}

document.querySelector("#addOrigin").addEventListener("click", () => {
  state.origins.push("");
  renderOrigins();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  state.origins = [...defaultOrigins];
  state.sort = "balance";
  availableOnly.checked = false;
  maxTime.value = "120";
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === "balance");
  });
  renderOrigins();
  renderResults();
});

document.querySelector("#shareButton").addEventListener("click", async () => {
  const checkin = document.querySelector("#checkin").value;
  const checkout = document.querySelector("#checkout").value;
  const text = `캠핑 검색조건: 출발지 ${state.origins.filter(Boolean).join(", ")} / 일정 ${checkin}~${checkout} / 정렬 ${state.sort}`;
  await navigator.clipboard.writeText(text);
  document.querySelector("#shareButton").textContent = "복사됨";
  setTimeout(() => {
    document.querySelector("#shareButton").textContent = "검색조건 복사";
  }, 1400);
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    state.sort = button.dataset.sort;
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.toggle("active", item === button));
    renderResults();
  });
});

maxTime.addEventListener("change", renderResults);
availableOnly.addEventListener("change", renderResults);

renderOrigins();
renderResults();
