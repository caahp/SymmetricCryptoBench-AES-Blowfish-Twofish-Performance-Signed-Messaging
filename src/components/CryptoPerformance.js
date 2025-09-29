import React, { useState, useCallback, useMemo } from 'react';
import CryptoJS from 'crypto-js';
import { Blowfish } from 'egoroof-blowfish';
import { TWOFISH } from 'encryption-for-node';

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
  Legend
);

const testLoops = [100, 1000, 10000, 100000];

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
                return cipher.encrypt(message)
            }
            }
        ];

        for (const loopCount of testLoops) {
            for (const algo of algorithms) {
                await new Promise(resolve => setTimeout(resolve, 10));
                try {
                    const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    const timeBefore = performance.now();
                    
                    for (let i = 0; i < loopCount; i++) {
                        algo.encrypt(inputText);
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
        };

        const algorithms = ['AES', 'Blowfish', 'Twofish'];
        algorithms.forEach(algoName => {
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
            <p className="text-gray-600 mb-4">Insira um texto, e a ferramenta medirá o desempenho de diferentes algoritmos de criptografia simétrica em vários cenários de carga.</p>
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-y focus:ring-2 focus:ring-blue-500" placeholder="Digite o texto aqui..."></textarea>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center transition-colors">
                {isAnalyzing ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.96 7.96 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analisando...</>) : "Analisar Desempenho"}
            </button>
            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Resultados Detalhados</h3>

                    {/* MUDANÇA PRINCIPAL: Loop para criar uma tabela por contagem de operações */}
                    {testLoops.map(loopCount => {
                        // Filtra os resultados apenas para a contagem de loop atual
                        const loopResults = results.filter(r => r.iterations === loopCount);
                        // Se ainda não houver resultados para este loop, não renderiza nada
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
                            <Line options={chartOptions('Tempo Médio de Execução por Carga')} data={timeChartData} />
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