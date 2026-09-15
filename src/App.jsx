import { useState, useEffect, useRef } from 'react';
import wordsData from './words.json';

// Diccionario para normalizar letras que el reconocedor de voz interpreta como palabras
const PHONETIC_MAP = {
  'ay': 'A', 'hey': 'A',
  'be': 'B', 'bee': 'B',
  'see': 'C', 'sea': 'C',
  'dee': 'D',
  'ee': 'E',
  'ef': 'F',
  'gee': 'G',
  'aitch': 'H', 'age': 'H', 'h': 'H',
  'eye': 'I', 'i': 'I',
  'jay': 'J',
  'kay': 'K',
  'el': 'L',
  'em': 'M',
  'en': 'N',
  'oh': 'O',
  'pea': 'P', 'pee': 'P',
  'cue': 'Q', 'queue': 'Q',
  'are': 'R', 'ar': 'R',
  'es': 'S', 'ice': 'S',
  'tea': 'T', 'tee': 'T',
  'you': 'U',
  'vee': 'V',
  'double you': 'W', 'w': 'W',
  'ex': 'X',
  'why': 'Y',
  'zed': 'Z', 'zee': 'Z'
};

const normalizeSpokenLetter = (token) => {
  const clean = token.toLowerCase().trim();
  if (clean.length === 1 && /[a-z]/i.test(clean)) {
    return clean.toUpperCase();
  }
  return PHONETIC_MAP[clean] || (clean.length === 1 ? clean.toUpperCase() : '');
};

export default function App() {
  const [round, setRound] = useState('round1');
  const [queue, setQueue] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [spokenLetters, setSpokenLetters] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFlashcard, setShowFlashcard] = useState(false);

  // Métricas de desempeño
  const [failedWords, setFailedWords] = useState(new Set());
  const [firstTryHits, setFirstTryHits] = useState(0);
  const [totalInitialWords, setTotalInitialWords] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Configuración del motor de reconocimiento por voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        
        // Separar las palabras/letras dictadas
        const tokens = transcript.trim().split(/\s+/);
        const mappedLetters = tokens.map(normalizeSpokenLetter).filter(Boolean);

        if (mappedLetters.length > 0) {
          setSpokenLetters((prev) => [...prev, ...mappedLetters]);
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      recognition.onend = () => {
        // Mantener activo el micrófono mientras la palabra esté en curso
        if (isActive && isListening) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isActive, isListening]);

  // Iniciar reconocimiento de audio
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (_) {}
    }
  };

  // Detener reconocimiento de audio
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Iniciar ronda
  const startRound = (selectedRound) => {
    setRound(selectedRound);
    const shuffled = [...wordsData[selectedRound]].sort(() => 0.5 - Math.random());
    setQueue(shuffled);
    setFailedWords(new Set());
    setFirstTryHits(0);
    setTotalInitialWords(shuffled.length);
    setIsRoundFinished(false);
    setFeedback(null);
    nextWord(shuffled[0], shuffled.slice(1), selectedRound);
  };

  // Cargar siguiente palabra
  const nextWord = (word, restQueue, activeRound = round) => {
    if (!word) {
      stopListening();
      setIsActive(false);
      setIsRoundFinished(true);
      setCurrentWord('');
      return;
    }

    setCurrentWord(word);
    setQueue(restQueue);
    setSpokenLetters([]);
    setTimeLeft(45);
    setIsActive(true);
    setFeedback(null);

    speakWord(word);

    if (activeRound === 'round2') {
      setShowFlashcard(true);
      setTimeout(() => setShowFlashcard(false), 2500);
    } else {
      setShowFlashcard(false);
    }

    // Activar escucha de inmediato
    setTimeout(() => startListening(), 800);
  };

  // Pronunciar la palabra
  const speakWord = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak || currentWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Temporizador de 45 segundos
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFailure('¡Tiempo agotado!');
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // Manejar fallo (por tiempo o deletreo erróneo)
  const handleFailure = (msg) => {
    stopListening();
    clearInterval(timerRef.current);
    
    // Marcar que esta palabra tuvo fallo para excluirla del conteo de "primer intento"
    setFailedWords((prev) => new Set(prev).add(currentWord));
    setFeedback({ type: 'error', msg: `${msg} Correcta: ${currentWord}` });

    const updatedQueue = [...queue, currentWord];
    setTimeout(() => {
      setFeedback(null);
      nextWord(updatedQueue[0], updatedQueue.slice(1));
    }, 2800);
  };

  // Validar el deletreo acumulado por voz
  const handleVerify = () => {
    stopListening();
    clearInterval(timerRef.current);

    const spelledString = spokenLetters.join('').toUpperCase();
    const targetString = currentWord.toUpperCase();

    if (spelledString === targetString) {
      // Suma al récord solo si nunca falló anteriormente
      if (!failedWords.has(currentWord)) {
        setFirstTryHits((prev) => prev + 1);
      }
      setFeedback({ type: 'success', msg: '¡Excelente! Deletreo correcto 🎉' });

      setTimeout(() => {
        setFeedback(null);
        if (queue.length > 0) {
          nextWord(queue[0], queue.slice(1));
        } else {
          setIsActive(false);
          setIsRoundFinished(true);
          setCurrentWord('');
        }
      }, 1500);
    } else {
      handleFailure(`Deletreaste "${spelledString || 'nada'}".`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 font-sans text-slate-800">
      <header className="w-full max-w-md my-4 text-center">
        <h1 className="text-2xl font-black text-orange-600 tracking-tight">Spelling Bee Oral Trainer</h1>
      </header>

      {/* Imagen */}
    <img
      src="./spelling-bee-l.png"
      alt="Spelling Bee"
      className="w-32 h-32 mb-4"
    />

      {/* Selector de Rondas */}
      <nav className="flex gap-2 mb-4 w-full max-w-md">
        {[
          { id: 'round1', label: 'Ronda 1' },
          { id: 'round2', label: 'Ronda 2' },
          { id: 'round3', label: 'Ronda 3' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => startRound(item.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl shadow-sm transition ${
              round === item.id 
                ? 'bg-orange-600 text-white shadow-orange-200' 
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Tarjeta Principal */}
      <main className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/70 p-6 flex flex-col items-center">
        {isActive ? (
          <>
            {/* Métricas y Cronómetro */}
            <div className="w-full flex justify-between items-center mb-4">
              <span className={`text-base font-bold px-3 py-1 rounded-full ${
                timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}>
                ⏱ {timeLeft}s
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                1ª opción: {firstTryHits}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Restantes: {queue.length + 1}
              </span>
            </div>

            {/* Visualización de la Palabra según la Ronda */}
            <div className="h-14 flex items-center justify-center mb-2 text-center">
              {round === 'round1' && (
                <p className="text-3xl font-extrabold tracking-wide text-slate-800">{currentWord}</p>
              )}
              {round === 'round2' && (
                <p className="text-3xl font-extrabold tracking-wide text-slate-800">
                  {showFlashcard ? currentWord : '••••••••'}
                </p>
              )}
              {round === 'round3' && (
                <span className="text-slate-400 italic text-sm">(Solo audio - escucha atentamente)</span>
              )}
            </div>

            {/* Botón para volver a escuchar */}
            <button
              type="button"
              onClick={() => speakWord()}
              className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full font-semibold text-sm hover:bg-orange-100 transition mb-4"
            >
              🔊 Repetir palabra
            </button>

            {/* Área de Deletreo Escuchado */}
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 min-h-24 flex flex-col items-center justify-center mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  {isListening ? 'Escuchando tu deletreo...' : 'Micrófono pausado'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {spokenLetters.length > 0 ? (
                  spokenLetters.map((letter, idx) => (
                    <span key={idx} className="w-9 h-11 bg-white border border-slate-300 rounded-lg flex items-center justify-center font-mono font-bold text-xl text-orange-700 shadow-sm">
                      {letter}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm italic">Pronuncia las letras en inglés...</span>
                )}
              </div>
            </div>

            {/* Controles de Acción */}
            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={() => setSpokenLetters([])}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition text-sm"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="flex-1 bg-orange-600 text-white py-3 rounded-2xl font-bold text-base shadow-md shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition"
              >
                Verificar Deletreo
              </button>
            </div>

            {/* Retroalimentación */}
            {feedback && (
              <div className={`mt-4 p-3 rounded-xl w-full text-center font-bold text-sm ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {feedback.msg}
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center flex flex-col items-center w-full">
            {isRoundFinished ? (
              <>
                <div className="text-5xl mb-3">🏅</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">¡Ronda Finalizada!</h2>
                
                {/* Resumen de Desempeño */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4">
                  <p className="text-sm text-slate-500 mb-1">Aciertos en el 1° intento</p>
                  <p className="text-4xl font-extrabold text-orange-600">
                    {firstTryHits} <span className="text-lg text-slate-400">/ {totalInitialWords}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Efectividad limpia: {Math.round((firstTryHits / (totalInitialWords || 1)) * 100)}%
                  </p>
                </div>

                <button
                  onClick={() => startRound(round)}
                  className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold hover:bg-orange-700 shadow-md transition"
                >
                  Practicar de nuevo
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🎙️</div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Deletreo Oral</h2>
                <p className="text-sm text-slate-500 mb-6">
                  El navegador usará tu micrófono para registrar cada letra que pronuncies en inglés.
                </p>
                <button
                  onClick={() => startRound(round)}
                  className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 shadow-md transition"
                >
                  Comenzar Práctica
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}