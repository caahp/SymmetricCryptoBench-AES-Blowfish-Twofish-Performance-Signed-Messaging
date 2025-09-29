// src/components/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import forge from 'node-forge';
import ChatPanel from './ChatPanel';
import { useShowNotification } from '../App'; // Importe o hook

const socket = io('http://localhost:4000');
function ChatPage() {
    const { showNotification } = useShowNotification(); // Use o hook
    const { userId } = useParams(); // Pega o nome do usuário da URL (Alice ou Bob)
    const [keys, setKeys] = useState(null);
    const [recipientPublicKey, setRecipientPublicKey] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Lida com o recebimento de mensagens
        const handleReceiveMessage = (data) => {
            if (data.recipient === userId) {
                setMessages(prev => [...prev, { ...data.message, author: data.sender }]);
            }
        };
        socket.on('receiveMessage', handleReceiveMessage);

        // Lida com o recebimento da chave pública do outro usuário
        const handleReceiveKey = (data) => {
            if (data.recipient === userId) {
                setRecipientPublicKey(data.publicKey);
                alert(`Chave pública de ${data.sender} recebida!`);
            }
        };
        socket.on('receivePublicKey', handleReceiveKey);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('receivePublicKey', handleReceiveKey);
        };
    }, [userId]);

    const getRecipientId = () => (userId === 'Alice' ? 'Bob' : 'Alice');

    const handleGenerateKeys = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
            const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
            setKeys({ publicKey: publicKeyPem, privateKey: keyPair.privateKey });
            
            // Compartilha a chave pública com o outro usuário através do servidor
            socket.emit('sharePublicKey', {
                sender: userId,
                recipient: getRecipientId(),
                publicKey: publicKeyPem,
            });
            setIsGenerating(false);
        }, 50);
    };

    const handleSendMessage = () => {
        if (!keys) { alert("Gere suas chaves primeiro!"); return; }
        if (!inputValue.trim()) return;

        const md = forge.md.sha256.create();
        md.update(inputValue, 'utf8');
        const signature = forge.util.encode64(keys.privateKey.sign(md));

        const messageData = {
            id: Date.now(),
            text: inputValue,
            signature: signature,
            senderPublicKey: keys.publicKey,
            verificationStatus: 'pending',
        };

        // Envia a mensagem para o servidor
        socket.emit('sendMessage', {
            sender: userId,
            recipient: getRecipientId(),
            message: messageData
        });

        // Adiciona a própria mensagem à tela
        setMessages(prev => [...prev, { ...messageData, author: userId }]);
        setInputValue('');
    };
    
    const handleVerifySignature = (messageId) => {
        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;

        try {
            const publicKey = forge.pki.publicKeyFromPem(msg.senderPublicKey);
            const signature = forge.util.decode64(msg.signature);
            const md = forge.md.sha256.create();
            md.update(msg.text, 'utf8');
            const isValid = publicKey.verify(md.digest().bytes(), signature);
            
            const newStatus = isValid ? 'valid' : 'invalid';
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, verificationStatus: newStatus } : m));
        } catch(e) { console.error(e); }
    };

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto">
            <ChatPanel
                currentUser={userId}
                keys={keys}
                messages={messages}
                isGenerating={isGenerating}
                onGenerateKeys={handleGenerateKeys}
                inputValue={inputValue}
                onInputChange={(e) => setInputValue(e.target.value)}
                onSendMessage={handleSendMessage}
                onVerifySignature={handleVerifySignature}
            />
        </div>
    );
}

export default ChatPage;