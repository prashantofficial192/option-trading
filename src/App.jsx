import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Home from "./components/Home";
import PaperTradeList from "./components/paper-trade/PaperTradeList";
import Calculator from "./components/profit-loss-calculator/Calculator";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          {/* <div className="brand">Trade Toolkit</div> */}
          <nav className="nav">
            {/* <Link to="/">Home</Link> */}
            <Link to="/">Calculator</Link>
            <Link to="/paper-trade">Paper Trade</Link>
          </nav>
        </header>

        <main className="main">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Calculator />} />
            <Route path="/paper-trade" element={<PaperTradeList />} />
          </Routes>
        </main>

        {/* <footer className="footer">© {new Date().getFullYear()} Prashant</footer> */}
      </div>
    </Router>
  );
}

export default App;