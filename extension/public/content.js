// content.js
// Runs on ChatGPT / Gemini / Claude pages
// Extracts the latest AI-generated response text

function extractAIText() {
  const hostname = window.location.hostname;
  let elements = [];

  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
    // ChatGPT: assistant messages are in [data-message-author-role="assistant"]
    elements = document.querySelectorAll('[data-message-author-role="assistant"]');
  } else if (hostname.includes("gemini.google.com")) {
    // Gemini: responses are in .model-response-text
    elements = document.querySelectorAll(".model-response-text, .response-content");
  } else if (hostname.includes("claude.ai")) {
    // Claude: assistant messages
    elements = document.querySelectorAll('[data-is-streaming="false"] .font-claude-message');
    if (elements.length === 0) {
      elements = document.querySelectorAll(".font-claude-message");
    }
  }

  if (elements.length === 0) return null;

  // Get the last (most recent) AI response
  const lastElement = elements[elements.length - 1];
  const text = lastElement.innerText.trim();

  return text.length > 20 ? text : null;
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAIText") {
    const text = extractAIText();
    sendResponse({ text });
  }
});
