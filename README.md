# 🧠 AI Website Builder CLI 🚀  
> _“Convert ideas into code – right from your terminal.”_

![AI Builder Banner](https://raw.githubusercontent.com/yourusername/ai-website-builder-cli/main/assets/banner.svg)

---

## 🧩 What is this?

This CLI tool uses **Gemini AI** + **Node.js** to turn your prompts into fully generated static websites (HTML/CSS/JS) — and even runs commands or writes files for you.  
Perfect for developers, designers, and anyone looking to prototype faster ⚡

---

## 🖼️ How It Works

![Workflow](https://raw.githubusercontent.com/yourusername/ai-website-builder-cli/main/assets/workflow.svg)

1. 🧠 You enter a website idea
2. 🤖 Gemini understands the intent
3. 🧾 It creates folders, HTML, CSS, JS
4. 🧪 Optionally runs terminal commands
5. ✅ Shows you results in real-time

---

## 📦 Features

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="10px"/> &nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="10px"/> &nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postman_icon.svg" height="30px"/> &nbsp;
<img src="https://www.svgrepo.com/show/376337/openai.svg" height="30px"/> &nbsp;

- 🧠 Gemini 2.5 Flash AI support
- 🛠️ Write files and folders via tool calls
- 💬 Maintains chat history context
- 🔁 Runs inside an infinite prompt loop
- ⚡ Fast, lightweight & portable

---

## 🛠️ Prerequisites

- ✅ Node.js v18+
- ✅ Gemini API key ([Get API Key](https://makersuite.google.com/app/apikey))

---

## 🚀 Installation

```bash
git clone https://github.com/yourusername/ai-website-builder-cli.git
cd ai-website-builder-cli
npm install
```

# 🔑 Setup Your API Key
Inside your code, update:

```js
const ai = new GoogleGenAI({
  apiKey: 'YOUR_API_KEY_HERE'
});
```
You can also load it via environment variables for better security.

# ▶️ Run the Project
```bash
node index.js
```

Then type a prompt like:
```👉 Enter website idea: A modern landing page for a travel agency```

# 🧪 Example Prompts
Prompt	Description
"Portfolio for a web developer"	💼 Responsive developer showcase
"Restaurant homepage with menu"	🍽️ Styled food site
"One-page fitness trainer profile"	🏋️ CTA, profile, and packages

# 📁 Example Output
```pgsql
MySite/
├── index.html
├── style.css
└── script.js`
```

# 📜 Terminal Tool Usage
```json
{
  "file": "myfolder/index.html",
  "content": "<!DOCTYPE html>..."
}
```
Or runs terminal operations like:
```Jsone
{ "command": "mkdir myfolder" }
```

You control structure, generation, and file logic ✨

# 💡 Tech Stack

| Tool           | Purpose               |
| -------------- | --------------------- |
| Node.js        | Core environment      |
| readline-sync  | CLI input             |
| Google GenAI   | AI-generated content  |
| child\_process | Shell commands        |
| fs / path / os | File system utilities |

# 🧑‍💻 Developer Friendly
✔️ Easily customizable
✔️ ESM module format
✔️ Gemini-compatible schema
✔️ Logs all AI ↔ tool interactions

# 🧩 Future Ideas
 Support for images/logos

 Auto-preview in browser

 React/Vue/Next.js generator mode

 Auto-deploy to GitHub Pages

# 🤝 Contribute
Pull requests are welcome!
If you’d like to suggest an idea or fix a bug, open an issue first.
Let’s build amazing things together 🚀


