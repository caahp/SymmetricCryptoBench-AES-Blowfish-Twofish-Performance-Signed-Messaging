import React, { useState } from "react";
import CryptoPerformance from "./components/CryptoPerformance";
import DigitalSignature from "./components/DigitalSignature";

function App() {
  const [activeTab, setActiveTab] = useState("signature");
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Função para mostrar notificações na tela
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3500);
  };

  // Renderiza o conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case "performance":
        return <CryptoPerformance showNotification={showNotification} />;
      case "signature":
        return <DigitalSignature showNotification={showNotification} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700 hover:bg-white"}`}
    >
      {label}
    </button>
  );

  const notificationColor =
    notification.type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 text-white py-3 px-5 rounded-lg shadow-lg animate-slide-in ${notificationColor}`}
        >
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Ferramentas Criptográficas
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Uma aplicação React para análise de algoritmos e demonstração de
          assinaturas digitais.
        </p>
      </header>
      <main>
        <div className="flex justify-center border-b border-gray-200">
          <TabButton tabName="performance" label="Análise de Desempenho" />
          <TabButton tabName="signature" label="Assinatura Digital" />
        </div>
        <div className="mt-[-1px] border-t border-gray-200">
          {renderTabContent()}
        </div>
      </main>
      <footer className="text-center mt-12 text-gray-500">
        <p>
          Desenvolvido como uma demonstração técnica de criptografia no lado do
          cliente.
        </p>
        <p>Nenhuma informação é armazenada ou enviada a um servidor.</p>
      </footer>
    </div>
  );
}

export default App;
