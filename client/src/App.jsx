import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AlgorithmLab from "./pages/AlgorithmLab";
import Comparison from "./pages/Comparison";
import InteractivePlayground from "./pages/InteractivePlayground";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyVault from "./pages/MyVault";
import CipherChallenge from "./pages/CipherChallenge";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lab" element={<AlgorithmLab />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/interactive" element={<InteractivePlayground />} />
            <Route path="/challenge" element={<CipherChallenge />} />
            <Route path="/vault" element={<MyVault />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
