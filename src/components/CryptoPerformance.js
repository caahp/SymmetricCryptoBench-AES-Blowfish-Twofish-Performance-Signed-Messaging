import React, { useState, useCallback, useMemo } from 'react';
import CryptoJS from 'crypto-js';
import { Blowfish } from 'egoroof-blowfish';
import { TWOFISH } from 'encryption-for-node';
import forge from 'node-forge';

// Importando os componentes de gráfico
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale, // Importando a escala logarítmica
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale // Registrando a escala logarítmica
);

const testLoops = [100, 1000, 10000, 100000];
const algorithmNames = ['AES', 'Blowfish', 'Twofish', 'SHA-256', 'RSA'];

function CryptoPerformance({ showNotification }) {
    const [inputText, setInputText] = useState("Esta é uma mensagem de teste para avaliar o desempenho dos algoritmos de criptografia. O objetivo é medir o tempo de processamento e o consumo de memória.");
    const [results, setResults] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = useCallback(async () => {
        if (!inputText) {
            showNotification("Por favor, insira um texto para analisar.");
            return;
        }

        setIsAnalyzing(true);
        setResults([]);
        
        const allResults = [];

        showNotification("Preparando algoritmos e gerando chave RSA (pode levar um momento)...", "success");
        await new Promise(resolve => setTimeout(resolve, 50));

        const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        const sha256Hash = CryptoJS.SHA256(inputText).toString(CryptoJS.enc.Hex);
        const dataForRsa = forge.util.hexToBytes(sha256Hash);

        const key = CryptoJS.enc.Utf8.parse("a-secret-key-123");
        const iv = CryptoJS.enc.Utf8.parse("an-iv-for-aes");
        const algorithms = [
            { name: 'AES', operation: (text) => CryptoJS.AES.encrypt(text, key, { iv: iv }) },
            { 
                name: "Blowfish",
                operation: (text) => {
                    const bf = new Blowfish("a-secret-key-123", Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
                    return bf.encode(text);
                }
            },
            { 
                name: "Twofish",
                operation: (text) => {
                    const cipher = new TWOFISH();
                    const key = new Uint8Array(16);
                    crypto.getRandomValues(key);
                    cipher.set_key(key);
                    const message = new TextEncoder().encode(text);
                    return cipher.encrypt(message);
                }
            },
            {
                name: "SHA-256",
                operation: (text) => CryptoJS.SHA256(text)
            },
            {
                name: "RSA",
                operation: () => rsaKeyPair.publicKey.encrypt(dataForRsa, 'RSA-OAEP')
            }
        ];

        for (const loopCount of testLoops) {
            for (const algo of algorithms) {
                await new Promise(resolve => setTimeout(resolve, 10));
                try {
                    const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    const timeBefore = performance.now();
                    
                    for (let i = 0; i < loopCount; i++) {
                        algo.name === 'RSA' ? algo.operation() : algo.operation(inputText);
                    }
                    
                    const timeAfter = performance.now();
                    const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    
                    const totalTime = timeAfter - timeBefore;
                    let memoryUsed = (memoryAfter - memoryBefore) / 1024;
                    memoryUsed = Math.max(0, memoryUsed);

                    allResults.push({
                        algorithm: algo.name,
                        iterations: loopCount,
                        time: (totalTime / loopCount).toFixed(5),
                        memory: performance.memory ? memoryUsed.toFixed(2) : 'Não suportado'
                    });
                } catch (e) {
                    allResults.push({
                        algorithm: algo.name,
                        iterations: loopCount,
                        time: 'Erro',
                        memory: 'Erro',
                        error: e.message
                    });
                }
            }
            setResults([...allResults]);
        }
        
        setIsAnalyzing(false);
        showNotification("Análise concluída!", "success");
    }, [inputText, showNotification]);

    const isMemoryApiSupported = useMemo(() => 'memory' in performance, []);

    const prepareChartData = (metric) => {
        const labels = testLoops;
        const datasets = [];
        const colors = {
            AES: 'rgb(255, 99, 132)',
            Blowfish: 'rgb(54, 162, 235)',
            Twofish: 'rgb(75, 192, 192)',
            'SHA-256': 'rgb(255, 206, 86)',
            RSA: 'rgb(153, 102, 255)',
        };

        algorithmNames.forEach(algoName => {
            const data = labels.map(loop => {
                const result = results.find(r => r.algorithm === algoName && r.iterations === loop);
                if (result && result[metric] !== 'Erro') {
                    return result[metric];
                }
                return null;
            });
            datasets.push({
                label: algoName,
                data: data,
                borderColor: colors[algoName],
                backgroundColor: `${colors[algoName]}B3`,
                fill: false,
                spanGaps: true,
            });
        });

        return { labels, datasets };
    };

    const timeChartData = useMemo(() => prepareChartData('time'), [results]);
    const memoryChartData = useMemo(() => prepareChartData('memory'), [results]);

    const chartOptions = (title) => ({
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title, font: { size: 16 } },
        },
        scales: {
            y: {
                // CORREÇÃO: A grafia correta é 'logarithmic'
                type: title.includes('Tempo') ? 'logarithmic' : 'linear',
                beginAtZero: true,
                title: {
                    display: true,
                    text: title.includes('Tempo') ? 'Tempo Médio (ms)' : 'Memória (aprox. KB)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Número de Operações'
                }
            }
        }
    });

    return (
        <div className="bg-white p-6 rounded-b-lg shadow-lg w-full max-w-5xl mx-auto animate-fade-in border border-t-0 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise de Desempenho Criptográfico</h2>
            <p className="text-gray-600 mb-4">Insira um texto, e a ferramenta medirá o desempenho de diferentes algoritmos de criptografia e hashing em vários cenários de carga.</p>
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-y focus:ring-2 focus:ring-blue-500" placeholder="Digite o texto aqui..."></textarea>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center transition-colors">
                {isAnalyzing ? "Analisando..." : "Analisar Desempenho"}
            </button>
            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Resultados Detalhados</h3>
                    {testLoops.map(loopCount => {
                        const loopResults = results.filter(r => r.iterations === loopCount);
                        if (loopResults.length === 0) return null;
                        return (
                            <div key={loopCount} className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                    Resultados para {loopCount.toLocaleString('pt-BR')} Operações
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left font-semibold p-3">Algoritmo</th>
                                                <th className="text-left font-semibold p-3">Tempo Médio (ms)</th>
                                                <th className="text-left font-semibold p-3">Memória (aprox. KB)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loopResults.map((result, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-3">{result.algorithm}</td>
                                                    <td className="p-3 font-mono">{result.time}</td>
                                                    <td className="p-3 font-mono">{result.memory}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                    <div className="mt-10 grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-3">Crescimento do Tempo de Execução</h3>
                            <Line options={chartOptions('Tempo Médio de Execução por Carga (Escala Logarítmica)')} data={timeChartData} />
                        </div>
                        {isMemoryApiSupported && (
                             <div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">Consumo de Memória</h3>
                                <Line options={chartOptions('Uso de Memória por Carga')} data={memoryChartData} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CryptoPerformance;