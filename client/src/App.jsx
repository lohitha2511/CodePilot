import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CodeGeneration from './pages/CodeGeneration';
import TestCases from './pages/TestCases';
import Debug from './pages/Debug';
import ErrorAnalysis from './pages/ErrorAnalysis';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<CodeGeneration />} />
          <Route path="/test-cases" element={<TestCases />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/error-analysis" element={<ErrorAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;