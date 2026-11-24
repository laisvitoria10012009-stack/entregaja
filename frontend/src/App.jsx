
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Atividades from "./pages/Atividades.jsx";
import Eventos from "./pages/Eventos.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/atividades" element={<Atividades />} />
            <Route path="/eventos" element={<Eventos />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
