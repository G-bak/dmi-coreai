// ./assets/js/app.js
import { toggleSidebar, closeSidebar, autoResize, scrollToBottom, scrollToTop } from "./assets/js/utils.js";
import { initialMessages, initialErrorMessages } from "./assets/js/data/init-dummy-msg.js";
import { CoreAPI } from "./assets/js/common/core-api.js";
import { sendMessageToServer } from "./assets/js/sendToMessage.js";

// =========================
// 요소 선택 헬퍼
// =========================
const $ = (selector, root = document) => root.querySelector(selector);

// 메시지가 append될 곳
const chatMessagesEl = $("#chatMessages");
const chatFormEl = $("#chatForm");
const chatInputEl = $("#chatInput");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const closeBtn = document.getElementById("sidebarCloseBtn");
const sendBtn = document.querySelector(".btn-send");

// 🔹 초기에는 데모 모드 ON
let demoMode = true;

// =========================
// 메시지 DOM 생성
// =========================
function createMessageElement(message) {
  const isUser = message.role === "user";

  const row = document.createElement("div");
  if (isUser) row.classList.add("message-row--user");

  const blk = document.createElement("div");
  blk.classList.add("message-blk");
  blk.classList.add(isUser ? "message-blk--user" : "message-blk--assistant");

  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar");
  avatar.classList.add(
    isUser ? "message-avatar--user" : "message-avatar--assistant"
  );
  avatar.textContent = isUser ? "Me" : "AI";

  const bodyWrap = document.createElement("div");
  bodyWrap.classList.add("message-body");

  const meta = document.createElement("div");
  meta.classList.add("message-meta");
  meta.textContent = isUser ? "사용자" : "Core";

  const content = document.createElement("div");
  content.textContent = message.content;

  bodyWrap.appendChild(meta);
  bodyWrap.appendChild(content);

  blk.appendChild(avatar);
  blk.appendChild(bodyWrap);
  row.appendChild(blk);

  return row;
}

// =========================
// 메시지 렌더링
// =========================
function renderMessages(messages) {
  chatMessagesEl.innerHTML = "";
  messages.forEach((msg) => {
    chatMessagesEl.appendChild(createMessageElement(msg));
  });
  scrollToBottom();
}

// =========================
// Enter = 전송, Shift+Enter = 줄바꿈
// =========================
chatInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatFormEl.requestSubmit();
  }
});

// =========================
// 폼 전송 (메시지 추가)
// =========================
chatFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInputEl.value.trim();
  if (!text) return;

  const userMsg = { role: "user", content: text };
  chatMessagesEl.appendChild(createMessageElement(userMsg));
  scrollToBottom();

  chatInputEl.value = "";
  autoResize();

  // ⭐ 전송 버튼 비활성화
  sendBtn.textContent = "";
  sendBtn.classList.add("loading");
  sendBtn.disabled = true;
  chatInputEl.placeholder = "서버 응답을 기다리는 중입니다..."
  chatInputEl.disabled = true;

  // 🔸 데모 모드일 때는 정적 메시지
  if (demoMode) {
    setTimeout(() => {
      const reply = {
        role: "assistant",
        content: `지금은 정적 데모라서\n"${text}"\n라는 내용을 그대로 받은 것만 보여줍니다.\n\n나중에 WebSocket 응답으로 교체하면 됩니다.`,
      };
      chatMessagesEl.appendChild(createMessageElement(reply));
      scrollToBottom();

      // ⭐ 통신 끝 → 다시 활성화
      sendBtn.textContent = "▷";
      sendBtn.classList.remove("loading");
      sendBtn.disabled = false;
      chatInputEl.placeholder = "메시지를 입력하세요..."
      chatInputEl.disabled = false;
    }, 0);
  } 
  // 🔥 이제 else에서는 서버 전송 함수 실행!
  else {
    try {
      const res = await sendMessageToServer(text);

      if (res?.data) {
        const reply = {
          role: "assistant",
          content: res.data.message || res.data.echo || "(응답 없음)",
        };
        chatMessagesEl.appendChild(createMessageElement(reply));
        scrollToBottom();
      } else {
        const reply = {
          role: "assistant",
          content:
            // "⚠️ 시스템 오류가 발생했습니다.\n\n잠시 후 다시 시도해 주세요.\n\n문제가 계속될 경우 관리자에게 문의해 주세요.",
            "⚠️ 현재는 정적 페이지만 배포된 환경입니다.",            
        };
        chatMessagesEl.appendChild(createMessageElement(reply));
        scrollToBottom();
      }
    } finally {
      // ⭐⭐ 서버 응답 후 무조건 전송 버튼 & 입력창 활성화
      sendBtn.textContent = "▷";
      sendBtn.classList.remove("loading");
      sendBtn.disabled = false;
      chatInputEl.placeholder = "메시지를 입력하세요..."
      chatInputEl.disabled = false;
    }
  }
});

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", async () => {
  sidebarToggleBtn.addEventListener("click", toggleSidebar);
  closeBtn.addEventListener("click", closeSidebar);
  chatInputEl.addEventListener("input", autoResize);
  autoResize();

  // =========================
  // 헬스체크 후 메시지 선택
  // =========================
  let initial = initialMessages;   // 기본은 정상 메시지

  // try {
  //   const res = await CoreAPI.health();

  //   // res.ok === false 이면 서버에서 에러 응답
  //   if (!res.ok) {
  //     console.warn("헬스체크 실패:", res);
  //     initial = initialErrorMessages;

  //     // === 입력창 & 버튼 비활성화 ===
  //     chatInputEl.disabled = true;
  //     chatInputEl.placeholder = "⚠️ 서버 연결 불가 — 메시지를 입력할 수 없습니다.";
      
  //     if (sendBtn) sendBtn.disabled = true;
  //   } else {
  //     if (sendBtn) sendBtn.disabled = false;
  //   }
  // } catch (err) {
  //   console.error("헬스체크 중 예외 발생:", err);
  //   initial = initialErrorMessages;
  // }

  // =========================
  // 초기 메시지 렌더링
  // =========================
  renderMessages(initial);
  scrollToTop();

  // 🔥 초기 더미 메시지 출력 끝! 이제부터는 데모 답변 금지
  demoMode = false;  
});
