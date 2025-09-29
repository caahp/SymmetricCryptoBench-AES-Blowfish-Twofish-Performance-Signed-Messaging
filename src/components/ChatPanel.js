import React, { useEffect, useRef } from 'react';

const VerificationStatus = ({ status }) => {
    if (status === 'valid') return <div className="flex items-center gap-1 text-green-700 font-bold"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Assinatura Válida</div>;
    if (status === 'invalid') return <div className="flex items-center gap-1 text-red-700 font-bold"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>Assinatura Inválida</div>;
    return null;
};

const ChatPanel = ({ currentUser, keys, messages, isGenerating, onGenerateKeys, onVerifySignature, inputValue, onInputChange, onSendMessage }) => {
    const chatEndRef = useRef(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg flex flex-col h-[70vh]">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Você está logado como: {currentUser}</h3>
                <button onClick={onGenerateKeys} disabled={isGenerating} className="w-full mt-2 bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 text-sm transition-colors">{isGenerating ? 'Gerando...' : 'Passo 1: Gerar e Compartilhar Chaves'}</button>
                {keys && <textarea readOnly value={keys.publicKey} className="mt-2 w-full p-2 border bg-white rounded-lg h-24 text-xs font-mono" placeholder="Sua Chave Pública."></textarea>}
            </div>
            <div className="flex-1 p-4 overflow-y-auto chat-window">
                {messages.map(msg => {
                    const isMyMessage = msg.author === currentUser;
                    return (
                        <div key={msg.id} className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-lg ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                                <p className="font-bold text-sm mb-1">
                                    {isMyMessage ? "Você" : msg.author}:
                                </p>
                                <p className="break-words">{msg.text}</p>
                                {/* ... (o restante da lógica da mensagem, details, etc. continua o mesmo) ... */}
                                {!isMyMessage && (
                                    <div className="mt-3 text-sm font-bold bg-gray-100 p-2 rounded-md">
                                        {msg.verificationStatus === 'pending' ? 
                                            <button onClick={() => onVerifySignature(msg.id)} className="w-full bg-yellow-500 text-yellow-900 text-xs font-bold py-1 px-2 rounded hover:bg-yellow-600">Verificar Assinatura</button> : 
                                            <VerificationStatus status={msg.verificationStatus} />}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <input type="text" value={inputValue} onChange={onInputChange} onKeyPress={(e) => e.key === 'Enter' && onSendMessage()} placeholder={keys ? "Digite sua mensagem..." : "Gere suas chaves primeiro..."} className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!keys} />
                    <button onClick={onSendMessage} disabled={!keys} className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">Enviar</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;