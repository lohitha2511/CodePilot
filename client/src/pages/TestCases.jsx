import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FaCheckCircle,
  FaSync,
  FaChartLine,
  FaPlay,
  FaCode,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function TestCases() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    sessionStorage.setItem("currentLanguage", newLanguage);
  };

  const generateTests = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As an expert QA engineer, generate comprehensive test cases for this ${language} code.
      Requirements:
      1. Use proper testing framework (Jest for JS, unittest for Python, JUnit for Java)
      2. Include tests for: valid inputs, invalid inputs, edge cases
      3. Add descriptive test names
      4. Return only the test code with no explanations
      5. Format properly with correct syntax
      
      Code to test:
      ${code}
      
      Test Cases:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanCode = text.replace(/```[\s\S]*?\n|```/g, "").trim();
      setCode(cleanCode);
    } catch (err) {
      setError(
        "Failed to generate tests. Please check your code and try again."
      );
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const runTests = async () => {
    setTestResults(null);
    setIsGenerating(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze these ${language} test cases and predict realistic results in JSON format:
      {
        "passed": number,
        "failed": number,
        "total": number,
        "coverage": "string",
        "duration": "string"
      }
      
      Consider:
      - Code complexity
      - Test case quality
      - Common failure patterns
      
      Tests:
      ${code}
      
      Return ONLY the JSON with no additional text or formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonString = text.replace(/```json|```/g, "").trim();
      const results = JSON.parse(jsonString);
      setTestResults(results);
    } catch (err) {
      setError("Failed to execute tests. Please validate your test cases.");
      console.error("Execution error:", err);
    } finally {
      setIsGenerating(false);
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
        <h1 className="text-4xl font-bold text-center">AI Test Automation</h1>
        <div className="w-24"></div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Test Suite</h2>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={generateTests}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaCode className="mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Generate Tests"}
                </button>
              </div>
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

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={runTests}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400"
              disabled={!code || isGenerating}
            >
              {isGenerating ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPlay className="mr-2" />
              )}
              Run Tests
            </button>
          </div>

          {testResults && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Passed Tests</p>
                  <p className="text-2xl font-bold text-green-700">
                    {testResults.passed}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">Failed Tests</p>
                  <p className="text-2xl font-bold text-red-700">
                    {testResults.failed}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Code Coverage</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {testResults.coverage}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {testResults.duration}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-2xl mb-3 flex items-center">
              <FaCheckCircle className="mr-2" />
              <h3 className="font-semibold">AI Test Generation</h3>
            </div>
            <p className="text-gray-600">
              Automatically creates comprehensive test cases covering:
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                <li>Positive scenarios</li>
                <li>Negative cases</li>
                <li>Edge conditions</li>
                <li>Boundary values</li>
              </ul>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-2xl mb-3 flex items-center">
              <FaSync className="mr-2" />
              <h3 className="font-semibold">Smart Execution</h3>
            </div>
            <p className="text-gray-600">
              Predictive test execution analysis with:
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                <li>Realistic outcome simulation</li>
                <li>Performance metrics</li>
                <li>Coverage estimation</li>
                <li>Failure pattern detection</li>
              </ul>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-blue-600 text-2xl mb-3 flex items-center">
              <FaChartLine className="mr-2" />
              <h3 className="font-semibold">Quality Metrics</h3>
            </div>
            <p className="text-gray-600">
              Detailed quality insights including:
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                <li>Test effectiveness score</li>
                <li>Code coverage analysis</li>
                <li>Vulnerability hotspots</li>
                <li>Maintainability index</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestCases;
