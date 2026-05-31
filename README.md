# AI Hallucination Detector — Chrome Extension

Detects hallucinations in AI-generated text from ChatGPT, Gemini, and Claude.

---

## Project Structure

```
hallucination-extension/
├── backend/
│   ├── main.py            # FastAPI backend
│   └── requirements.txt
└── extension/
    └── public/
        ├── manifest.json  # Chrome extension config
        ├── content.js     # Extracts AI text from page
        ├── popup.html     # Extension popup UI
        ├── popup.js       # Popup logic + API call
        └── icon.png
```

---

## Step 1 — Run the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

First run downloads the Vectara model (~500MB). Wait for:
```
Model loaded!
INFO: Uvicorn running on http://127.0.0.1:8000
```

Test it works:
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Einstein invented the telephone in 1875."}'
```

Expected response:
```json
{"score": 0.87, "label": "Highly Hallucinated"}
```

---

## Step 2 — Load the Chrome Extension

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/public/` folder
5. Extension appears in your toolbar

---

## Step 3 — Use It

1. Open ChatGPT, Gemini, or Claude
2. Get any AI response on screen
3. Click the extension icon
4. Click **Analyze**
5. See: ✅ Safe / ⚠️ Suspicious / 🚨 Highly Hallucinated

---

## How It Works

```
User clicks Analyze
    → popup.js asks content.js for AI text
    → content.js extracts text from the page DOM
    → popup.js sends text to FastAPI backend
    → backend runs Vectara hallucination model
    → returns { score, label }
    → popup.js displays result with color + confidence bar
```

---

## Model

Uses `vectara/hallucination_evaluation_model` from HuggingFace.
No training required — pre-trained and production-ready.
