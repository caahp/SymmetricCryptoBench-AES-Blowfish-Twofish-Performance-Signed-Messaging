import React, { useState } from 'react'; // Importe o useState
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom';
import CryptoPerformance from './components/CryptoPerformance';
import ChatPage from './components/ChatPage';

function Layout() {
  // 1. Mova a lógica de notificação para cá
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3500);
  };
  
  const notificationColor = notification.type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {/* 2. Renderize a notificação aqui */}
      {notification.message && (
        <div className={`fixed top-5 right-5 z-50 text-white py-3 px-5 rounded-lg shadow-lg animate-slide-in ${notificationColor}`}>
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Ferramentas Criptográficas
        </h1>
        <nav className="mt-4 flex justify-center gap-4 flex-wrap">
          <Link to="/" className="text-blue-600 hover:underline">Análise de Desempenho</Link>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="font-semibold">Chat Seguro (Abra em 2 abas):</span>
          <Link to="/chat/Alice" className="text-blue-600 hover:underline">Usuário Alice</Link>
          <Link to="/chat/Bob" className="text-blue-600 hover:underline">Usuário Bob</Link>
        </nav>
      </header>
      <main>
        {/* 3. Passe a função para os componentes filhos via 'context' */}
        <Outlet context={{ showNotification }} />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CryptoPerformance />} />
          <Route path="chat/:userId" element={<ChatPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Criando um hook customizado para facilitar o acesso à função
export function useShowNotification() {
  return useOutletContext();
}

export default App;