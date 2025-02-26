import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FaArrowLeft,
  FaCode,
  FaBug,
  FaTools,
  FaSearch,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function Debug() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [debugInfo, setDebugInfo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedCode = sessionStorage.getItem("currentCode");
    const savedLanguage = sessionStorage.getItem("currentLanguage");

    if (savedCode && savedLanguage) {
      setCode(savedCode);
      setLanguage(savedLanguage);
    }
  }, []);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
  ];

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    setError(null);
    setDebugInfo(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this ${language} code for issues and provide structured response:
      - Identify bugs, performance issues, and security vulnerabilities
      - Suggest concrete improvements
      - Calculate complexity metrics
      
      Return JSON format:
      {
        "issues": [
          {
            "type": "bug|performance|security",
            "line": number,
            "message": string
          }
        ],
        "performance": {
          "score": number,
          "suggestions": string[]
        },
        "complexity": {
          "score": number,
          "details": string
        }
      }
      
      Code:
      ${code}
      
      Return ONLY the JSON with no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonString = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(jsonString);

      if (!analysis.issues || !analysis.performance || !analysis.complexity) {
        throw new Error("Invalid analysis format");
      }

      setDebugInfo(analysis);
    } catch (err) {
      setError("Failed to analyze code. Please check the code and try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" />
          Back to Editor
        </button>
        <h1 className="text-4xl font-bold text-center">AI Code Analysis</h1>
        <button
          onClick={() => navigate("/error-analysis")}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          <FaExclamationTriangle className="mr-2" />
          Error Analysis
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={analyzeCode}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaBug className="mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Code"}
              </button>
            </div>
            <div className="h-[500px]">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
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

          {debugInfo && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Code Quality Score</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {debugInfo.performance.score}%
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Complexity Score</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {debugInfo.complexity.score}%
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Identified Issues</h3>
                <div className="space-y-3">
                  {debugInfo.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-700">
                          Line {issue.line}:{" "}
                          {issue.type.charAt(0).toUpperCase() +
                            issue.type.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-red-600">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {debugInfo.performance.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Optimization Suggestions
                  </h3>
                  <div className="space-y-2">
                    {debugInfo.performance.suggestions.map(
                      (suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                        >
                          <p className="text-green-700">{suggestion}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-2xl mb-3 flex items-center">
              <FaSearch className="mr-2" />
              <h3 className="font-semibold">Deep Analysis</h3>
            </div>
            <p className="text-gray-600">
              AI-powered inspection of your codebase for:
              <ul className="list-disc list-inside mt-2 pl-2 space-y-1">
                <li>Logical errors</li>
                <li>Performance bottlenecks</li>
                <li>Security vulnerabilities</li>
                <li>Code smells</li>
              </ul>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-2xl mb-3 flex items-center">
              <FaTools className="mr-2" />
              <h3 className="font-semibold">Complexity Metrics</h3>
            </div>
            <p className="text-gray-600">
              Detailed complexity analysis including:
              <ul className="list-disc list-inside mt-2 pl-2 space-y-1">
                <li>Cyclomatic complexity</li>
                <li>Cognitive complexity</li>
                <li>Maintainability index</li>
                <li>Code churn analysis</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Debug;
