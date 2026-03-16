// /assets/js/common/core-api.js
import { apiGet, apiPost } from "/assets/js/common/api.js";

console.log("✅ Core-API.JS Load On!");

export const CoreAPI = {
  // 헬스 체크
  health: () =>
    apiGet("/system/health", {}, { expect: "json" }),

  // 1차: 텍스트 전처리 요청
  preprocessMessage: (content) =>
    apiPost("/api/preprocess", { content }, { expect: "json" }),

  // 2차: 전처리 결과 기반 보고서(JSON) 검색
  searchReports: (payload) =>
    apiPost("/api/reports/search", { payload }, { expect: "json" }),  

  // 3차: 2차 검색 결과 전체를 서버로 다시 보내서 체인 로직 수행
  chainReports: (chainInput) =>
    apiPost("/api/reports/chain", chainInput, { expect: "json" }),  
};
