// /assets/js/sendToMessage.js
import { CoreAPI } from "/assets/js/common/core-api.js";
import { createStatusBubble, scrollToBottom } from "/assets/js/utils.js";

console.log("✅ SendToMessage.JS Load On!");

const $ = (selector, root = document) => root.querySelector(selector);
const chatMessagesEl = $("#chatMessages");

export async function sendMessageToServer(text) {
  if (!text) return;

  let loadingBubble = null;

  try {
    // 1) 전처리 중 말풍선
    loadingBubble = createStatusBubble("입력 분석 중…");
    chatMessagesEl.appendChild(loadingBubble);
    scrollToBottom();

    const preprocessRes = await CoreAPI.preprocessMessage(text);
    loadingBubble.remove();

    // 2) 전처리 성공 시
    if (preprocessRes?.data.ok) {
      console.log(preprocessRes.data);
      // ✅ 기존처럼 sections만 사용 (cleaned 안 씀)
      const sections = preprocessRes.data.sections;

      // 2차: 보고서 검색 중 말풍선
      loadingBubble = createStatusBubble("관련 보고서 검색 중…");
      chatMessagesEl.appendChild(loadingBubble);
      scrollToBottom();

      const searchRes = await CoreAPI.searchReports(sections);
      loadingBubble.remove();

      // ===========================
      // 3차: 검색 결과 체인 호출
      // ===========================
      const chainInput = searchRes?.data ?? searchRes;

      loadingBubble = createStatusBubble(`전체 ${searchRes.data.pqi_all.items.length}건 검색됨.\n유사도 분석/정리 중…`);
      chatMessagesEl.appendChild(loadingBubble);
      scrollToBottom();

      const chainRes = await CoreAPI.chainReports(chainInput);
      loadingBubble.remove();

      // 최종 3차 결과 리턴
      return chainRes;
    } else {
      return preprocessRes;
    }

  } catch (err) {
    console.error("❌ 서버 오류:", err);
    if (loadingBubble) loadingBubble.remove();
    return null;
  }
}
