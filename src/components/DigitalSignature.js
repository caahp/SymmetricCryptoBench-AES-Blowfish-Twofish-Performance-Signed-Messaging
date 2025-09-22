import React, { useState } from 'react';
import forge from 'node-forge';
import ChatPanel from './ChatPanel';

function DigitalSignature({ showNotification }) {
    const [senderKeys, setSenderKeys] = useState(null);
    const [receiverKeys, setReceiverKeys] = useState(null);
    const [isGenerating, setIsGenerating] = useState({ sender: false, receiver: false });
    const [messages, setMessages] = useState([]);
    const [senderInput, setSenderInput] = useState("");

    const generateKeysFor = (userType) => {
        setIsGenerating(prev => ({ ...prev, [userType]: true }));
        setTimeout(() => {
            const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
            const newKeys = {
                publicKey: forge.pki.publicKeyToPem(keys.publicKey),
                privateKey: keys.privateKey
            };
            if (userType === 'sender') setSenderKeys(newKeys);
            else setReceiverKeys(newKeys);
            setIsGenerating(prev => ({ ...prev, [userType]: false }));
            showNotification(`Chaves para ${userType === 'sender' ? 'Remetente' : 'Destinatário'} geradas!`, 'success');
        }, 50);
    };

    const handleSignAndSend = () => {
        if (!senderKeys) {
            showNotification("Remetente: Gere suas chaves primeiro!");
            return;
        }
        if (!senderInput.trim()) {
            showNotification("Digite uma mensagem para enviar.");
            return;
        }

        const md = forge.md.sha256.create();
        md.update(senderInput, 'utf8');
        const sig = senderKeys.privateKey.sign(md);
        const base64Signature = forge.util.encode64(sig);

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: senderInput,
            signature: base64Signature,
            senderPublicKey: senderKeys.publicKey,
            verificationStatus: 'pending'
        }]);
        setSenderInput("");
    };

    const handleVerifySignature = (messageId) => {
        const messageToVerify = messages.find(m => m.id === messageId);
        if (!messageToVerify) return;

        try {
            const publicKey = forge.pki.publicKeyFromPem(messageToVerify.senderPublicKey);
            const signatureBytes = forge.util.decode64(messageToVerify.signature);
            const md = forge.md.sha256.create();
            md.update(messageToVerify.text, 'utf8');
            const isValid = publicKey.verify(md.digest().bytes(), signatureBytes);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, verificationStatus: isValid ? 'valid' : 'invalid' } : m));
        } catch (error) {
            showNotification("Falha na verificação. Dados inválidos.");
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, verificationStatus: 'invalid' } : m));
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto bg-white p-6 rounded-b-lg shadow-lg border border-t-0 border-gray-200">
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-2">Simulação de Chat com Assinatura Digital</h2>
            <p className="text-gray-600 text-center mb-6 text-sm">Cada lado gera suas chaves. O remetente envia uma mensagem assinada, e o destinatário a verifica.</p>
            <div className="grid md:grid-cols-2 gap-6">
                <ChatPanel
                    userType="sender"
                    keys={senderKeys}
                    messages={messages}
                    isGenerating={isGenerating.sender}
                    onGenerateKeys={() => generateKeysFor('sender')}
                    inputValue={senderInput}
                    onInputChange={(e) => setSenderInput(e.target.value)}
                    onSendMessage={handleSignAndSend}
                />
                <ChatPanel
                    userType="receiver"
                    keys={receiverKeys}
                    messages={messages}
                    isGenerating={isGenerating.receiver}
                    onGenerateKeys={() => generateKeysFor('receiver')}
                    onVerifySignature={handleVerifySignature}
                />
            </div>
        </div>
    );
}

export default DigitalSignature;
