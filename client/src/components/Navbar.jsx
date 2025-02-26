import { Link, useLocation } from "react-router-dom";
import {
  FaCode,
  FaVial,
  FaBug,
  FaExclamationTriangle,
  FaRobot,
} from "react-icons/fa";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-primary text-white"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <FaRobot className="text-primary text-3xl" />
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CodePilot <i>Beta</i>
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/")}`}
            >
              <FaCode className="mr-2" />
              Code Generation
            </Link>
            <Link
              to="/test-cases"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/test-cases")}`}
            >
              <FaVial className="mr-2" />
              Test Cases
            </Link>
            <Link
              to="/debug"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/debug")}`}
            >
              <FaBug className="mr-2" />
              Debug
            </Link>
            <Link
              to="/error-analysis"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/error-analysis")}`}
            >
              <FaExclamationTriangle className="mr-2" />
              Error Analysis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
