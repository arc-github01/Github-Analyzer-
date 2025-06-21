# 🔍 GitHub Analyzer Chrome Extension

A powerful Chrome extension that analyzes GitHub commits and repositories using the **Gemini API** to generate insightful reports and comprehensive `README.md` files.

---

## ✨ Features

- 📄 **Commit Analysis**  
  Get detailed summaries of any GitHub commit including:
  - Commit intent
  - Files changed
  - Functional impact
  - Suggestions and best practices

- 📘 **Auto-generated README.md**  
  Instantly generate professional README files for any GitHub repository with:
  - Project overview
  - Setup instructions
  - Folder structure
  - Contribution guidelines
  - License section

- 🔗 **Seamless GitHub Integration**  
  Buttons appear directly on GitHub commit and repo pages.

- 🧠 Powered by Gemini Pro  
  Uses the Gemini LLM API for natural language analysis.





---

## 🚀 How It Works

1. **Commit Analysis**  
   When viewing a GitHub commit, click the `Analyze Commit` button. The extension fetches commit data and calls the Gemini API to return a structured report.

2. **README Generation**  
   When on a GitHub repository page, click `Generate README`. It gathers repo metadata, structure, and language stats and feeds it to Gemini for README generation.

3. **Popup Interface**  
   The popup allows you to analyze the current page without using injected buttons.

---

## 🛠 Installation

1. **Clone this repository** or [download as ZIP](https://github.com/user/repo/archive/refs/heads/main.zip)

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked** and select the `github-analyzer-extension/` folder

5. Navigate to a GitHub **commit** or **repository** page and click the extension icon

---

## ⚙️ Configuration

### 🔑 Gemini API Key

> ⚠️ **IMPORTANT**: For demo purposes, the API key is hardcoded. In production, you **must** secure it via a proxy server or OAuth flow.

Update the `API_KEY` in `background.js`:

```javascript
const API_KEY = "YOUR_GEMINI_API_KEY";
