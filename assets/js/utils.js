// /assets/js/utils.js

// =========================
// 요소 선택 헬퍼
// =========================
const $ = (selector, root = document) => root.querySelector(selector);

// 스크롤이 걸릴 곳
const chatInputEl = $("#chatInput");
const chatMessagesWrapperEl = $(".chat-messages");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const appEl = document.querySelector(".app");

let isSidebarOpen = false;

// =========================
// 사이드바 열기/닫기
// =========================
export function openSidebar() {
  isSidebarOpen = true;
  appEl.classList.add("sidebar-open");
  sidebarToggleBtn.textContent = "✕";
}

export function closeSidebar() {
  isSidebarOpen = false;
  appEl.classList.remove("sidebar-open");
  sidebarToggleBtn.textContent = "☰";
}

export function toggleSidebar() {
  isSidebarOpen ? closeSidebar() : openSidebar();
}

// =========================
// textarea 자동 높이 증가
// =========================
export function autoResize() {
  chatInputEl.style.height = "auto";
  chatInputEl.style.height = chatInputEl.scrollHeight + "px";
}

// =========================
// 자동 스크롤 (해결 2 방식 적용)
// =========================
export function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessagesWrapperEl.scrollTop = chatMessagesWrapperEl.scrollHeight;
  });
}

export function scrollToTop() {
  requestAnimationFrame(() => {
    chatMessagesWrapperEl.scrollTop = 0;
  });
}

// 로딩 말풍선 생성 함수
export function createStatusBubble(message) {
  const row = document.createElement("div");

  const blk = document.createElement("div");
  blk.classList.add("message-blk", "message-blk--assistant");

  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar", "message-avatar--assistant");
  avatar.textContent = "AI";

  const body = document.createElement("div");
  body.classList.add("message-body");

  const meta = document.createElement("div");
  meta.classList.add("message-meta");
  meta.textContent = "Core · 처리 중…";

  // 🟡 typing indicator 그대로 유지
  const typing = document.createElement("div");
  typing.classList.add("typing-indicator");
  typing.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  // 🟢 메시지 부분을 새로운 div로 분리 (여기서 \n 줄바꿈 적용)
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("loading-message");
  msgDiv.textContent = message;   // ← textContent는 \n 그대로 반영됨

  body.appendChild(meta);
  body.appendChild(typing);
  body.appendChild(msgDiv);       // ← 메시지 div 추가

  blk.appendChild(avatar);
  blk.appendChild(body);
  row.appendChild(blk);

  return row;
}
