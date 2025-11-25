import { Routes, Route } from "react-router-dom";
import VanSelectorPage from "./pages/VanSelectorPage.jsx";
import VanInventoryPage from "./pages/VanInventoryPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-background text-textMain">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Van Inventory</h1>
          <span className="text-xs text-textMuted">MERN · van ops</span>
        </header>

        <Routes>
          <Route path="/" element={<VanSelectorPage />} />
          <Route path="/van/:vanId" element={<VanInventoryPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
