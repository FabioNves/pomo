import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PomodoroTimer from "./components/PomodoroTimer";
import Analytics from "./Analytics";

function App() {
  return (
    <Router>
      <div>
        <nav className="flex h-16 justify-center gap-5 p-4 bg-gray-800 text-white">
          <a href="/" className="hover:underline">
            Timer
          </a>
          <a href="/analytics" className="hover:underline">
            Analytics
          </a>
        </nav>
        <Routes>
          <Route path="/" element={<PomodoroTimer />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
