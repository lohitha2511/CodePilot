import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { debounce } from "lodash";
import {
  FaRobot,
  FaLightbulb,
  FaCopy,
  FaDownload,
  FaVial,
  FaBug,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function CodeGeneration() {
  const navigate = useNavigate();
  const [code, setCode] = useState("// Start coding here...");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState("");
  const messagesEndRef = useRef(null);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
    { id: "csharp", name: "C#" },
    { id: "php", name: "PHP" },
    { id: "ruby", name: "Ruby" },
    { id: "swift", name: "Swift" },
    { id: "go", name: "Go" },
    { id: "rust", name: "Rust" },
  ];

  const debouncedGenerateSuggestions = useCallback(
    debounce(async (currentCode) => {
      if (currentCode === lastGeneratedCode) return;

      setIsSuggestionsLoading(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the following code and provide 1-3 concise, actionable improvement suggestions in numbered list format.
//       Focus on code quality, performance, and best practices. Be specific and reference line numbers where applicable.
//       Don't format your output, keep it in plaintext. Also, only use 5-7 words per suggestion. Only give sensible and meaningful suggestions. Give less if none are needed.
//       Code:
//       ${currentCode}

//       Suggestions:`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();

        const suggestions = text
          .split("\n")
          .filter((line) => line.match(/^\d+\./))
          .map((line) => line.replace(/^\d+\.\s*/, "").trim());

        setSuggestions(suggestions);
        setLastGeneratedCode(currentCode);
      } catch (error) {
        console.error("Error generating suggestions:", error);
        setSuggestions(["Could not generate suggestions at this time"]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 2000),
    []
  );

  const handleRefreshSuggestions = async () => {
    debouncedGenerateSuggestions.cancel();
    await debouncedGenerateSuggestions(code);
  };

  const handleEditorChange = (value) => {
    setCode(value);
    debouncedGenerateSuggestions(value);
    sessionStorage.setItem("currentCode", value);
    sessionStorage.setItem("currentLanguage", language);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    const templates = {
      javascript:
        '// JavaScript code here\nfunction example() {\n  return "Hello, World!";\n}',
      python: '# Python code here\ndef example():\n    return "Hello, World!"',
      java: '// Java code here\npublic class Example {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '// C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      csharp:
        '// C# code here\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
      php: '<?php\n// PHP code here\nfunction example() {\n    return "Hello, World!";\n}\n?>',
      ruby: '# Ruby code here\ndef example\n  "Hello, World!"\nend',
      swift:
        '// Swift code here\nfunc example() -> String {\n    return "Hello, World!"\n}',
      go: '// Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      rust: '// Rust code here\nfn main() {\n    println!("Hello, World!");\n}',
    };

    setCode(templates[newLanguage] || templates.javascript);
    debouncedGenerateSuggestions(
      templates[newLanguage] || templates.javascript
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        const originalOutput = output;
        setOutput("Code copied to clipboard!");
        setTimeout(() => setOutput(originalOutput), 2000);
      })
      .catch((err) => setOutput(`Error copying code: ${err.message}`));
  };

  const handleDownloadCode = () => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      swift: "swift",
      go: "go",
      rust: "rs",
    };

    const extension = extensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const originalOutput = output;
    setOutput("Code downloaded successfully!");
    setTimeout(() => setOutput(originalOutput), 2000);
  };

  const navigateToTests = () => {
    sessionStorage.setItem("currentCode", code);
    sessionStorage.setItem("currentLanguage", language);
    navigate("/test-cases");
  };

  const navigateToDebug = () => {
    sessionStorage.setItem("currentCode", code);
    sessionStorage.setItem("currentLanguage", language);
    navigate("/debug");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      isBot: false,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are CodePilot, an expert programming assistant. Format responses with:
    - Code blocks using \`\`\`${language} ... \`\`\` syntax
    - Clear section separation
    
    Current language: ${language}
    User's query: "${inputMessage}"
    Current Code: ${code}

    Only respond with a code if asked. Otherwise, answer the query.
    Answer only what's asked, don't explain too much unless asked. If not related to Code/Techincal stuff, don't answer it.
    Don't format your response except for any code blocks.
    Provide detailed, formatted assistance:
    
    Don't make it sound like you are continuing the conversation. Treat each message as its own thing.`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();

      const formatResponse = (text) => {
        const parts = text.split(/(```[\s\S]*?```)/g);
        return parts.map((part, index) => {
          if (part.startsWith("```")) {
            const langMatch = part.match(/^```(\w+)\n/);
            const lang = langMatch ? langMatch[1] : "";
            const code = part.replace(/```(\w+)?\n/, "").replace(/```$/, "");
            return { type: "code", content: code, lang, key: index };
          }
          return { type: "text", content: part, key: index };
        });
      };

      const botResponse = {
        text: formatResponse(text),
        isBot: true,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        text: [
          {
            type: "text",
            content: "⚠️ Error processing request. Please try again.",
            key: 0,
          },
        ],
        isBot: true,
        isError: true,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    return () => debouncedGenerateSuggestions.cancel();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-screen flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        AI-Powered Code Generation
      </h1>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Code Editor
                </h2>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <FaCopy className="mr-2" />
                  Copy
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={navigateToTests}
              className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FaVial className="mr-2" />
              Generate Test Cases
            </button>
            <button
              onClick={navigateToDebug}
              className="flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <FaBug className="mr-2" />
              Debug Code
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0 h-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col flex-1 min-h-0">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <div className="flex items-center">
                <FaLightbulb className="text-yellow-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  AI Suggestions
                </h2>
              </div>
              <button
                onClick={handleRefreshSuggestions}
                disabled={isSuggestionsLoading}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm"
              >
                {isSuggestionsLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                Refresh
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg group hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="text-gray-700 dark:text-gray-200 text-sm">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col flex-1 min-h-0">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <FaRobot className="text-blue-500 mr-2" />
                Ask CodePilot
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.timestamp}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"} mb-4`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.isBot
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "bg-blue-500 text-white"
                    } ${message.isError ? "bg-red-100 dark:bg-red-900" : ""}`}
                  >
                    {Array.isArray(message.text) ? (
                      message.text.map((part) => (
                        <div key={part.key} className="mb-2 last:mb-0">
                          {part.type === "code" ? (
                            <div className="relative mt-2 mb-4">
                              <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl">
                                {part.lang || "code"}
                              </div>
                              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                <code className={`language-${part.lang}`}>
                                  {part.content}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <div className="prose text-white max-w-none text-sm">
                              {part.content.split("\n").map((line, idx) => (
                                <p key={idx} className="mb-2">
                                  {line.replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>"
                                  )}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask CodePilot..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeGeneration;
