import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function ErrorAnalysis() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeError = async () => {
    if (!errorMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this programming error and provide detailed response in this format:
      Error Type: [Type of error]
      Likely Cause: [Possible reason for error]
      Solutions:
      - [Solution 1]
      - [Solution 2]
      - [Solution 3]
      
      Error Message: ${errorMessage}
      
      Answer only coding-related questions and don't format your response.`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();

      const analysis = {
        type: extractValue(text, "Error Type:"),
        cause: extractValue(text, "Likely Cause:"),
        solutions: extractList(text, "Solutions:"),
      };

      setErrorAnalysis(analysis);
    } catch (err) {
      setError("Failed to analyze error. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractValue = (text, label) => {
    const regex = new RegExp(`${label}\\s*([^\\n]+)`);
    const match = text.match(regex);
    return match ? match[1].replace(/\*\*/g, "").trim() : "Not available";
  };

  const extractList = (text, label) => {
    const regex = new RegExp(`${label}\\s*\\n-\\s*(.*?)(\\n\\*\\*|$)`, "gs");
    const matches = [...text.matchAll(regex)];
    return matches.map((m) => m[1].trim()).filter(Boolean);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/debug")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" />
          Back to Debug
        </button>
        <h1 className="text-4xl font-bold text-center">Error Analysis</h1>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                Error Message Analysis
              </h2>
              <button
                onClick={analyzeError}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                disabled={!errorMessage || isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Error"
                )}
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Message
              </label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Paste your error message here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {errorAnalysis && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                  Analysis Results
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Error Type</h4>
                    <p className="text-gray-700 mt-1">
                      {errorAnalysis.type.replace(/\*\*/g, "")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Likely Cause
                    </h4>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {errorAnalysis.cause.replace(/\*\*/g, "")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-yellow-500 text-2xl mb-4 flex items-center">
              <FaSearch className="mr-2" />
              <h3 className="font-semibold">How It Works</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Our AI-powered error analysis tool:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Analyzes error patterns using Gemini AI</li>
                <li>Identifies common programming mistakes</li>
                <li>Suggests context-aware solutions</li>
                <li>Provides code examples when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorAnalysis;
