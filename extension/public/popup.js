const API_URL = "http://localhost:8000/predict";

const btn      = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultBox= document.getElementById("result-box");
const emojiEl  = document.getElementById("emoji");
const labelEl  = document.getElementById("label");
const scoreEl  = document.getElementById("score");
const barEl    = document.getElementById("bar");
const previewEl= document.getElementById("preview");

function setStatus(msg) {
  resultBox.style.display = "none";
  statusEl.style.display = "block";
  statusEl.textContent = msg;
  document.body.className = "";
}

function showResult(score, label, text) {
  statusEl.style.display = "none";
  resultBox.style.display = "block";

  const map = {
    "Safe":                { emoji: "✅", cls: "safe" },
    "Suspicious":          { emoji: "⚠️", cls: "suspicious" },
    "Highly Hallucinated": { emoji: "🚨", cls: "hallucinated" },
  };
  const c = map[label] || map["Suspicious"];

  emojiEl.textContent = c.emoji;
  labelEl.textContent = label;
  scoreEl.textContent = `${Math.round(score * 100)}% hallucination probability`;
  document.body.className = c.cls;

  setTimeout(() => { barEl.style.width = Math.round(score * 100) + "%"; }, 50);
  previewEl.textContent = `"${text.slice(0, 120)}${text.length > 120 ? "…" : ""}"`;
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = "Analyzing...";
  setStatus("Reading AI response...");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let response;
  try {
    response = await chrome.tabs.sendMessage(tab.id, { action: "getAIText" });
  } catch (e) {
    setStatus("❌ Open ChatGPT, Gemini, or Claude first.");
    btn.disabled = false; btn.textContent = "Analyze"; return;
  }

  if (!response?.text) {
    setStatus("❌ No AI response found on this page.");
    btn.disabled = false; btn.textContent = "Analyze"; return;
  }

  setStatus("Running analysis...");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    showResult(data.score, data.label, response.text);
  } catch {
    setStatus("❌ Backend not reachable. Run the server first.");
  }

  btn.disabled = false; btn.textContent = "Analyze";
});
