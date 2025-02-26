# CodePilot

CodePilot is an AI-powered code testing and quality analysis tool designed to enhance the software development process. Built with *ReactJS/Vite* and powered by Gemini 1.5 Flash API, CodePilot automates key aspects of development, including *code generation, error analysis, test case generation, and debugging*. The application runs entirely in the browser, requiring no backend setup.

## Features

- *Code Generation* – Get AI-powered code suggestions in real time as you type and use an integrated chatbot to generate code snippets on demand.
- *Error Analysis* – Paste error messages to receive detailed explanations and recommended fixes.
- *Test Case Generation* – Automatically generate unit test cases and evaluate code quality.
- *Debugging & Optimization* – Scan your code for bugs and receive AI-driven suggestions for optimization.

---

## 📌 Getting Started

Follow these steps to set up and run CodePilot locally.

### Prerequisites

- *Node.js* (v14 or later) – [Download here](https://nodejs.org/)
- *npm* (comes with Node.js) or *yarn*
- A modern web browser (Chrome, Firefox, Edge, etc.)

### Installation

1. *Clone the Repository*  
   Open a terminal and run:
   - `git clone https://github.com/lohitha2511/CodePilot.git`
   - `cd CodePilot`
   

2. *Install Dependencies*  
   Install the required packages:

  - `npm install`

3. *Configure Environment Variables*  
   Create a .env file in the **client** folder and add the following line to it. You can get this API key by visiting the following website and following the on-screen instructions:

   [API Key from Google](https://aistudio.google.com/app/apikey)
   
  - `VITE_GEMINI_API_KEY = your_api_key_here`

4. *Run the Development Server*  
   Start the application in development mode:
   
   - `npm run dev`
   
   Open the provided URL (e.g., http://localhost:5173) in your browser to use CodePilot.

---

## 🛠 Technologies Used

- *ReactJS* – Frontend framework for building the UI.
- *Vite* – Lightning-fast bundler and development server.
- *Gemini 1.5 Flash API* – AI-powered coding assistant.
- *Monaco Editor* – Integrated code editor for a seamless development experience.

---

## 🚀 Key Highlights

- *Fully AI-Driven* – Uses the *Gemini API* to analyze, generate, and optimize code.
- *No Backend Required* – Runs entirely in the browser for an easy setup.
- *Hot Module Reloading* – Instant feedback during development with *Vite*.
- *Optimized for Performance* – Lightweight and fast execution.

---

⭐ *If you find CodePilot useful, don't forget to star the repository!* ⭐
