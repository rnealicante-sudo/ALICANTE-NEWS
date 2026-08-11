import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, Square, Pause, Play, Copy, Check, Radio, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { GroupedNews, ThemeType } from '../types';

interface EscaletaModalProps {
  isOpen: boolean;
  newsGroups: GroupedNews[];
  theme?: ThemeType;
  onClose: () => void;
}

export const EscaletaModal: React.FC<EscaletaModalProps> = ({
  isOpen,
  newsGroups,
  theme = 'dark',
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [copied, setCopied] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(-1);

  const isLight = theme === 'light';
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Top 6 news for radio bulletin
  const topNews = newsGroups.slice(0, 6);

  // Calculate exact current time and date for radio speech
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const dayName = daysOfWeek[now.getDay()];
  const dayNumber = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  const timeSpoken = `Son las ${hours} ${hours === 1 ? 'hora' : 'horas'} y ${minutes === 0 ? 'en punto' : minutes === 1 ? 'un minuto' : `${minutes} minutos`} del ${dayName}, ${dayNumber} de ${monthName} de ${year}`;

  // Build radio script
  const introScript = `${timeSpoken}. Emite Central Telegráfica de Noticias de Alicante. Presentamos el boletín informativo con la actualidad más importante de Alicante y provincia en estos últimos minutos.`;
  
  const newsScripts = topNews.map((group, i) => {
    const sourceNames = group.sources.map(s => s.source).join(', ');
    const muniText = group.municipality ? ` en ${group.municipality}` : '';
    return {
      id: group.id,
      index: i + 1,
      category: group.category.toUpperCase(),
      title: group.mainTitle,
      sources: sourceNames,
      municipality: group.municipality,
      spokenText: `Titular número ${i + 1}. ${group.mainTitle}${muniText}. ${group.summary}. Información contrastada por ${sourceNames}.`,
    };
  });

  const outroScript = "Hasta aquí las principales noticias en este boletín de Alicante BY REVOX. Gracias por su atención y sigan informados en nuestro teletipo en tiempo real.";

  const fullTextToRead = [
    introScript,
    ...newsScripts.map(n => n.spokenText),
    outroScript,
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleStartSpeech = () => {
    if (!synthRef.current) {
      alert('Tu navegador no admite reproducción de texto a voz (Speech Synthesis).');
      return;
    }

    synthRef.current.cancel();
    setIsPaused(false);
    setIsPlaying(true);
    setCurrentBlockIndex(0);

    // Read full bulletin sequentially
    let index = 0;

    const speakNext = () => {
      if (index >= fullTextToRead.length) {
        setIsPlaying(false);
        setCurrentBlockIndex(-1);
        return;
      }

      setCurrentBlockIndex(index);
      const text = fullTextToRead[index];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = speechRate;

      // Select Spanish voice if available
      const voices = synthRef.current?.getVoices() || [];
      const esVoice = voices.find(v => v.lang.startsWith('es-ES') || v.lang.startsWith('es'));
      if (esVoice) {
        utterance.voice = esVoice;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = (e) => {
        console.error('TTS error:', e);
        setIsPlaying(false);
        setCurrentBlockIndex(-1);
      };

      synthRef.current?.speak(utterance);
    };

    speakNext();
  };

  const handlePauseResume = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBlockIndex(-1);
  };

  const handleCopyScript = () => {
    const formattedScript = `--- ESCALETA / BOLETIN DE RADIO - CENTRAL TELEGRAFICA DE NOTICIAS DE ALICANTE BY REVOX ---
Fecha: ${new Date().toLocaleDateString('es-ES')}

[ENTRADILLA / CARETA DE ENTRADA]
${introScript}

[DESARROLLO DE NOTICIAS]
${newsScripts.map(n => `
• [NOTICIA ${n.index} - ${n.category}] ${n.title}
  Municipio: ${n.municipality || 'Provincia de Alicante'}
  Fuentes: ${n.sources}
  Texto locución: ${n.spokenText}
`).join('\n')}

[CIERRE / CARETA DE SALIDA]
${outroScript}
-----------------------------------------------------------------------------------------`;

    navigator.clipboard.writeText(formattedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0a0f18] border-[#1e293b] text-white'
      }`}>
        
        {/* Header Modal */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#050608] border-[#1e293b]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg text-white shadow-md">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-base sm:text-lg uppercase tracking-wider">
                  MODO ESCALETA & BOLETÍN DE RADIO
                </h2>
                <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  BY REVOX
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Guion estructurado para emisión radiofónica con reproducción de voz automática (Text-To-Speech)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Controls Bar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-red-50 border-red-200' : 'bg-[#0f172a] border-[#1e293b]'
        }`}>
          <div className="flex items-center space-x-3">
            {!isPlaying && !isPaused ? (
              <button
                onClick={handleStartSpeech}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase px-4 py-2 rounded-md shadow flex items-center space-x-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Escuchar Boletín por Voz</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase px-4 py-2 rounded-md shadow flex items-center space-x-2 transition"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                </button>

                <button
                  onClick={handleStop}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-black text-xs uppercase px-3 py-2 rounded-md shadow flex items-center space-x-1.5 transition"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Detener</span>
                </button>
              </>
            )}

            {/* Speech Rate Selector */}
            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Velocidad:</span>
              {[1.0, 1.2, 1.4].map(rate => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                    speechRate === rate
                      ? 'bg-red-600 text-white'
                      : isLight
                      ? 'bg-white text-slate-700 border border-slate-300'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isPlaying && (
              <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                <Volume2 className="w-4 h-4" />
                <span>Locutando bloque {currentBlockIndex + 1} / {fullTextToRead.length}</span>
              </span>
            )}

            <button
              onClick={handleCopyScript}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 border ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Guion'}</span>
            </button>
          </div>
        </div>

        {/* Script Content / Escaleta Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-sans">
          
          {/* Careta Entradilla */}
          <div className={`p-4 rounded-lg border relative ${
            currentBlockIndex === 0 ? 'ring-2 ring-red-500 bg-red-500/10' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-[#1e293b]'
          }`}>
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-red-500 mb-1.5 tracking-wider">
              <Radio className="w-4 h-4" />
              <span>CARETA DE ENTRADA / PRESENTACIÓN DEL BOLETÍN</span>
            </div>
            <p className="text-sm italic font-serif leading-relaxed">
              "{introScript}"
            </p>
          </div>

          {/* Bloque de Noticias Escogidas */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2 border-b pb-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span>BLOQUE PRINCIPAL DE NOTICIAS ({newsScripts.length} TITULARES)</span>
            </h3>

            {newsScripts.map((news, idx) => {
              const isCurrentReading = currentBlockIndex === idx + 1;

              return (
                <div
                  key={news.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrentReading
                      ? 'ring-2 ring-amber-500 bg-amber-500/10 border-amber-500/50 shadow-lg'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                        NOTICIA {news.index}
                      </span>
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                        {news.category}
                      </span>
                      {news.municipality && (
                        <span className="text-xs font-bold bg-slate-700/30 text-slate-300 px-2 py-0.5 rounded">
                          📍 {news.municipality}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Fuente: {news.sources}
                    </span>
                  </div>

                  <h4 className="font-bold text-base mb-2">
                    {news.title}
                  </h4>

                  <div className={`p-3 rounded text-xs font-serif leading-relaxed border ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-black/40 border-slate-800 text-slate-300'
                  }`}>
                    <span className="font-sans font-bold text-red-500 mr-2 uppercase text-[10px]">🎙️ GUION LOCUCIÓN:</span>
                    {news.spokenText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Careta Salida */}
          <div className={`p-4 rounded-lg border relative ${
            currentBlockIndex === fullTextToRead.length - 1 ? 'ring-2 ring-red-500 bg-red-500/10' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-[#1e293b]'
          }`}>
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-red-500 mb-1.5 tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>CARETA DE CIERRE / FINAL DEL BOLETÍN</span>
            </div>
            <p className="text-sm italic font-serif leading-relaxed">
              "{outroScript}"
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
