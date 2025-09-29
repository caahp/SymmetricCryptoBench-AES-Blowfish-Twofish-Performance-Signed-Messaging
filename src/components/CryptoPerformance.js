import React, { useState, useCallback, useMemo } from 'react';
import {Blowfish} from 'egoroof-blowfish';
import CryptoJS from 'crypto-js';
import {TWOFISH} from 'encryption-for-node';


function CryptoPerformance({ showNotification }) {
    const [inputText, setInputText] = useState("Esta é uma mensagem de teste para avaliar o desempenho dos algoritmos de criptografia. O objetivo é medir o tempo de processamento e o consumo de memória.");
    const [results, setResults] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = useCallback(() => {
        if (!inputText) {
            showNotification("Por favor, insira um texto para analisar.");
            return;
        }

        setIsAnalyzing(true);
        setResults([]);

        setTimeout(() => {
            const analysisResults = [];
            const key = CryptoJS.enc.Utf8.parse("a-secret-key-123");
            const iv = CryptoJS.enc.Utf8.parse("an-iv-for-aes");

            const algorithms = [
                { name: 'AES', encrypt: (text) => CryptoJS.AES.encrypt(text, key, { iv: iv }) },
                { 
                name: "Blowfish",
                encrypt: (text) => {
                    const bf = new Blowfish("a-secret-key-123", Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
                    return bf.encode(text);
                }
                },
                { 
                name: "Twofish",
                encrypt: (text) => {
                    const cipher = new TWOFISH();
                    const key = new Uint8Array(16);
                    crypto.getRandomValues(key);
                    cipher.set_key(key)  
                    const message = new TextEncoder().encode(text)
                    console.log(message);
                    return cipher.encrypt(message)
                }
                }
            ];

            for (const algo of algorithms) {
                if (!algo.encrypt) {
                    analysisResults.push({ name: algo.name, time: 'N/A', memory: 'N/A', error: 'Biblioteca não disponível.' });
                    continue;
                }
                try {
                    const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    const timeBefore = performance.now();
                    for (let i = 0; i < 100; i++) {
                        algo.encrypt(inputText);
                    }
                    const timeAfter = performance.now();
                    const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    const totalTime = timeAfter - timeBefore;
                    const memoryUsed = (memoryAfter - memoryBefore) / 1024;
                    analysisResults.push({
                        name: algo.name,
                        time: (totalTime / 100).toFixed(4),
                        memory: performance.memory ? `${memoryUsed.toFixed(2)} KB` : 'Não suportado'
                    });
                } catch (e) {
                    analysisResults.push({ name: algo.name, time: 'Erro', memory: 'Erro', error: e.message });
                }
            }
            setResults(analysisResults);
            setIsAnalyzing(false);
        }, 100);
    }, [inputText, showNotification]);

    const isMemoryApiSupported = useMemo(() => 'memory' in performance, []);

    return (
        <div className="bg-white p-6 rounded-b-lg shadow-lg w-full max-w-4xl mx-auto animate-fade-in border border-t-0 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise de Desempenho Criptográfico</h2>
            <p className="text-gray-600 mb-4">Insira um texto, e a ferramenta medirá o desempenho de diferentes algoritmos de criptografia simétrica.</p>
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-y focus:ring-2 focus:ring-blue-500" placeholder="Digite o texto aqui..."></textarea>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center transition-colors">
                {isAnalyzing ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.96 7.96 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analisando...</>) : "Analisar Desempenho"}
            </button>
            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Resultados</h3>
                    {!isMemoryApiSupported && (<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md" role="alert"><p><b>Aviso:</b> A API de medição de memória (performance.memory) não é suportada neste navegador.</p></div>)}
                    <div className="overflow-x-auto"><table className="min-w-full bg-white border"><thead><tr className="bg-gray-50"><th className="text-left font-semibold p-3">Algoritmo</th><th className="text-left font-semibold p-3">Tempo (ms)</th><th className="text-left font-semibold p-3">Memória (aprox.)</th></tr></thead><tbody>{results.map((r, i) => (<tr key={i} className="border-t"><td className="p-3">{r.name}</td><td className="p-3">{r.time}</td><td className="p-3">{r.memory}{r.error && <span className="text-red-500 text-sm block">{r.error}</span>}</td></tr>))}</tbody></table></div>
                    <p className="text-sm text-gray-500 mt-2">*O tempo é a média de 100 operações.</p>
                </div>
            )}
        </div>
    );
}

export default CryptoPerformance;
