import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {

  // 🔁 CHANGE TO false ON REAL BIRTHDAY
  const TEST_MODE = false; // true = 10 sec test | false = real date

  const [stage, setStage] = useState("countdown");
  const [timeLeft, setTimeLeft] = useState(null);
  const [candlesLit, setCandlesLit] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [openedGifts, setOpenedGifts] = useState([]);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const musicRef = useRef(null);
  const audioContextRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const giftMessages = [
    "You're an amazing friend! 💝",
    "Your smile lights up the room! ✨",
    "Stay awesome always! 🌟",
    "You make the world better! 🌍",
  ];

  const quizQuestions = [
    {
      q: "What's your superpower?",
      options: ["Making people smile 😊", "Being awesome 🌟", "Spreading joy 🎉", "All of the above! 💫"],
      correct: 3
    },
    {
      q: "What makes you special?",
      options: ["Your kindness 💝", "Your energy ⚡", "Your humor 😄", "Everything! ✨"],
      correct: 3
    },
    {
      q: "Best thing about you?",
      options: ["Your heart ❤️", "Your vibe 🌈", "Your smile 😁", "Can't pick one! 🎊"],
      correct: 3
    }
  ];

  // ⏳ COUNTDOWN LOGIC
  useEffect(() => {
    let target;
    
    if (TEST_MODE) {
      target = new Date(Date.now() + 10 * 1000);
    } else {
      const now = new Date();
      const birthdayMonth = 9; // October (0-indexed, so 9 = October)
      const birthdayDay = 9;   // 9th day
      
      // Try current year first
      target = new Date(now.getFullYear(), birthdayMonth, birthdayDay, 0, 0, 0);
      
      // If birthday already passed this year, set to next year
      if (target <= now) {
        target = new Date(now.getFullYear() + 1, birthdayMonth, birthdayDay, 0, 0, 0);
      }
    }

    const timer = setInterval(() => {
      const diff = target - new Date();
      if (diff <= 0) {
        clearInterval(timer);
        setStage("birthday");
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🎤 MICROPHONE BLOW DETECTION
  useEffect(() => {
    if (stage !== "cake" || candlesLit === 0) return;

    let animationId;
    const startListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        microphone.connect(analyser);
        analyser.fftSize = 512;

        const checkBlow = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          // Lower threshold for easier blowing
          if (average > 25) {
            setCandlesLit(prev => {
              const newVal = Math.max(0, prev - 1);
              if (newVal === 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
              }
              return newVal;
            });
          }
          
          if (candlesLit > 0) {
            animationId = requestAnimationFrame(checkBlow);
          }
        };
        
        checkBlow();
      } catch (err) {
        console.log("Microphone access denied - click candles to blow them out manually");
      }
    };

    startListening();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stage, candlesLit]);

  // ✍️ TYPEWRITER EFFECT
  useEffect(() => {
    if (stage === "final") {
      const fullText = "This isn't just a surprise… it's a small way of saying you matter more than you know 💗...Hamesha khush raho , muskurate raho aur ladte raho ...Jaise ho hamesha waise hi rehna ";
      let index = 0;
      
      const timer = setInterval(() => {
        if (index <= fullText.length) {
          setTypewriterText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [stage]);

  // 🎨 SCRATCH CARD HANDLER
  const handleScratch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Check if enough is scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    if (transparent / (pixels.length / 4) > 0.5) {
      setScratchRevealed(true);
    }
  };

  // 📸 CAMERA SETUP
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("Camera access denied");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden
                    bg-gradient-to-br from-rose-50 via-white to-fuchsia-100">

      {/* 🎵 BACKGROUND MUSIC */}
      <audio ref={musicRef} src="/birthday.webm" loop preload="auto" />

      <AnimatePresence mode="wait">

        {/* ⏳ COUNTDOWN */}
        {stage === "countdown" && timeLeft && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h1 className="text-2xl mb-8 text-gray-700">
              Countdown to something special 🎁
            </h1>

            <div className="flex gap-4 flex-wrap justify-center">
              {Object.entries(timeLeft).map(([k, v]) => (
                <div
                  key={k}
                  className="bg-white/70 backdrop-blur rounded-2xl shadow-md px-6 py-4 min-w-[90px]"
                >
                  <div className="text-3xl font-bold text-pink-500">{v}</div>
                  <div className="text-xs uppercase text-gray-500">{k}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🎉 HAPPY BIRTHDAY */}
        {stage === "birthday" && (
          <motion.div
            key="birthday"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl px-12 py-12 text-center max-w-lg"
          >
            <h1 className="text-5xl font-extrabold text-pink-500 mb-4">
              🎉 Happy Birthday Parmotion 🎉
            </h1>
            <p className="text-gray-500 text-lg mb-10">
              A day as special as you 💖
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => {
                  musicRef.current.volume = 0.4;
                  musicRef.current.play();
                  setStage("scratch");
                }}
                className="px-12 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-500
                           text-white rounded-full text-xl shadow-lg hover:scale-105 transition"
              >
                Let's Celebrate 🎂
              </button>
            </div>
          </motion.div>
        )}

        {/* 🎨 SCRATCH CARD */}
        {stage === "scratch" && (
          <motion.div
            key="scratch"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl px-12 py-12 text-center max-w-lg"
          >
            <h2 className="text-3xl mb-6 text-gray-800">
              Scratch to reveal your surprise! 🎁
            </h2>
            
            <div className="relative inline-block">
              {!scratchRevealed && (
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  onMouseMove={(e) => e.buttons === 1 && handleScratch(e)}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    handleScratch(touch);
                  }}
                  className="absolute top-0 left-0 cursor-pointer"
                  style={{ touchAction: 'none' }}
                />
              )}
              
              <div className="w-[300px] h-[200px] bg-gradient-to-br from-purple-400 to-pink-400 
                            rounded-2xl flex items-center justify-center text-white text-xl font-bold p-6">
                You're about to experience something special! 🌟✨
              </div>
            </div>

            {scratchRevealed && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setStage("quiz")}
                className="mt-6 px-10 py-3 bg-pink-500 text-white rounded-full hover:scale-105 transition"
              >
                Continue 🚀
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 🎮 BIRTHDAY QUIZ */}
        {stage === "quiz" && !showQuizResult && (
          <motion.div
            key="quiz"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl px-12 py-12 text-center max-w-2xl"
          >
            <h2 className="text-3xl mb-8 text-gray-800">
              Quick Birthday Quiz! 🎯
            </h2>

            {quizQuestions.map((quiz, idx) => (
              <div key={idx} className="mb-8 text-left">
                <p className="text-xl mb-4 font-semibold text-gray-700">{quiz.q}</p>
                <div className="grid grid-cols-1 gap-3">
                  {quiz.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                      className={`px-6 py-3 rounded-xl text-left transition ${
                        quizAnswers[idx] === optIdx 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(quizAnswers).length === quizQuestions.length && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setShowQuizResult(true)}
                className="mt-4 px-10 py-3 bg-green-500 text-white rounded-full hover:scale-105 transition"
              >
                See Results! 🎉
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 🎊 QUIZ RESULT */}
        {stage === "quiz" && showQuizResult && (
          <motion.div
            key="quiz-result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl px-12 py-12 text-center max-w-lg"
          >
            <h2 className="text-4xl mb-6 text-pink-500">
              You're 100% AWESOME! 🌟
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Because every answer about you is perfect! 💝
            </p>
            
            <button
              onClick={() => setStage("photobooth")}
              className="px-10 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                       text-white rounded-full hover:scale-105 transition"
            >
              Next Surprise 📸
            </button>
          </motion.div>
        )}

        {/* 📸 PHOTO BOOTH */}
        {stage === "photobooth" && (
          <motion.div
            key="photobooth"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl px-12 py-12 text-center max-w-2xl"
          >
            <h2 className="text-3xl mb-6 text-gray-800">
              Strike a Birthday Pose! 📸
            </h2>

            {!showCamera ? (
              <button
                onClick={() => {
                  setShowCamera(true);
                  startCamera();
                }}
                className="px-10 py-4 bg-pink-500 text-white rounded-full text-xl hover:scale-105 transition"
              >
                Open Camera 📷
              </button>
            ) : (
              <div className="relative inline-block">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="rounded-2xl max-w-full"
                  style={{ maxHeight: '400px' }}
                />
                
                {/* Birthday Hat Overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl"
                     style={{ marginTop: '-40px' }}>
                  🎩
                </div>
                
                {/* Crown Overlay */}
                <div className="absolute top-0 right-4 text-5xl"
                     style={{ marginTop: '-30px' }}>
                  👑
                </div>

                <div className="mt-6 flex gap-4 justify-center">
                  <button
                    onClick={() => setStage("question")}
                    className="px-8 py-3 bg-green-500 text-white rounded-full hover:scale-105 transition"
                  >
                    Looking Good! Continue 🚀
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ❓ QUESTION */}
        {stage === "question" && (
          <motion.div
            key="question"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl px-14 py-12 text-center max-w-xl"
          >
            <h2 className="text-3xl mb-10">
              Do you wanna see what I made for you? 😉
            </h2>

            <div className="flex gap-6 justify-center flex-wrap">
              <button
                onClick={() => setStage("preview")}
                className="px-10 py-4 bg-green-500 text-white
                           rounded-full text-lg hover:scale-110 transition"
              >
                YES 😍
              </button>

              <button
                onClick={() => setStage("funny")}
                className="px-10 py-4 bg-gray-200
                           rounded-full text-lg hover:scale-105 transition"
              >
                Nahi, main darr gaya 😆
              </button>
            </div>
          </motion.div>
        )}

        {/* 😂 FUNNY */}
        {stage === "funny" && (
          <motion.div
            key="funny"
            initial={{ rotate: -2, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="bg-yellow-50 rounded-3xl shadow-xl px-10 py-10 text-center"
          >
            <p className="text-xl mb-8">
              😏 Itni aasani se nahi bach paoge!
            </p>

            <button
              onClick={() => setStage("preview")}
              className="px-8 py-3 bg-yellow-400 rounded-full
                         text-lg hover:scale-105 transition"
            >
              Accha dikha hi do 😭
            </button>
          </motion.div>
        )}

        {/* 🚀 PREVIEW */}
        {stage === "preview" && (
          <motion.div
            key="preview"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-pink-500 to-purple-500
                       text-white rounded-3xl shadow-2xl px-12 py-12 text-center"
          >
            <h2 className="text-3xl mb-10">
              But first... open these gifts! 🎁
            </h2>

            <div className="flex gap-6 justify-center flex-wrap mb-10">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!openedGifts.includes(i)) {
                      setOpenedGifts([...openedGifts, i]);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {!openedGifts.includes(i) ? (
                    <div className="text-6xl">🎁</div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="bg-white/20 backdrop-blur px-4 py-3 rounded-xl text-sm"
                    >
                      {giftMessages[i]}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {openedGifts.length === 4 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setStage("cake")}
                className="px-12 py-4 bg-white text-pink-600
                           rounded-full text-xl hover:scale-110 transition"
              >
                Now Let's Go! 🚀
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 🎂 CAKE */}
        {stage === "cake" && (
          <motion.div
            key="cake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 aurora"></div>

            {/* 🎊 CONFETTI */}
            {showConfetti && [...Array(100)].map((_, i) => (
              <span key={`c${i}`} className="confetti"
                style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9de0', '#e15554'][Math.floor(Math.random() * 5)]
                }}></span>
            ))}

            {[...Array(45)].map((_, i) => (
              <span key={`b${i}`} className="balloon"
                style={{ left: `${Math.random() * 100}%` }}>🎈</span>
            ))}

            {[...Array(50)].map((_, i) => (
              <span key={`h${i}`} className="heart"
                style={{ left: `${Math.random() * 100}%` }}>💖</span>
            ))}

            <div className="text-center z-10">
              {/* CANDLES */}
              <div className="flex gap-6 justify-center mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="relative">
                    {i < candlesLit && (
                      <motion.div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl cursor-pointer"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        onClick={() => {
                          setCandlesLit(prev => {
                            const newVal = Math.max(0, prev - 1);
                            if (newVal === 0) {
                              setShowConfetti(true);
                              setTimeout(() => setShowConfetti(false), 5000);
                            }
                            return newVal;
                          });
                        }}
                      >
                        🕯️
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {candlesLit > 0 && (
                <p className="text-white text-lg mb-4 bg-black/30 px-4 py-2 rounded-full">
                  🎤 Blow into your mic or click candles to put them out!
                </p>
              )}

              <div className="w-56 h-16 bg-pink-200 rounded-t-3xl mx-auto"></div>
              <div className="w-64 h-18 bg-pink-300 rounded-3xl -mt-4 mx-auto"></div>
              <div className="w-72 h-24 bg-pink-400 rounded-3xl -mt-4
                              flex items-center justify-center text-3xl shadow-xl
                              relative overflow-hidden">
                {/* 3D Cake Layers with Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-pink-300 to-pink-500"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(255,182,193,0.5)",
                      "0 0 40px rgba(255,105,180,0.8)",
                      "0 0 20px rgba(255,182,193,0.5)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="relative z-10 text-4xl">🎂</span>
                
                {/* Frosting drips */}
                <div className="absolute top-0 left-4 w-2 h-6 bg-white rounded-b-full opacity-70"></div>
                <div className="absolute top-0 right-8 w-2 h-8 bg-white rounded-b-full opacity-70"></div>
                <div className="absolute top-0 left-1/2 w-2 h-5 bg-white rounded-b-full opacity-70"></div>
              </div>

              {candlesLit === 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setStage("final")}
                  className="mt-10 px-10 py-4 bg-white text-pink-600
                             rounded-full text-lg hover:scale-110 transition"
                >
                  Continue 💌
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* 💖 FINAL MESSAGE */}
        {stage === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            onAnimationComplete={() => setShowFireworks(true)}
            className="bg-white rounded-3xl shadow-2xl px-14 py-12 text-center max-w-xl relative z-10"
          >
            {/* 🎆 FIREWORKS */}
            {showFireworks && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`fw${i}`}
                    className="firework"
                    initial={{ 
                      scale: 0, 
                      x: Math.random() * window.innerWidth - window.innerWidth/2,
                      y: Math.random() * window.innerHeight - window.innerHeight/2
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 6
                    }}
                    style={{
                      position: 'fixed',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: '3px solid',
                      borderColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9de0', '#e15554'][i % 5],
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </>
            )}

            {/* ✍️ TYPEWRITER TEXT */}
            <p className="text-xl text-gray-700 leading-relaxed min-h-[120px]">
              {typewriterText}
              <span className="animate-pulse">|</span>
            </p>
            
            <div className="mt-6">
              <p className="text-2xl font-bold text-pink-500"> Happy Birthday 🎉</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 🎨 EFFECTS */}
      <style>{`
        .aurora {
          background:
            radial-gradient(circle at 20% 20%, rgba(255,0,128,0.5), transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(0,200,255,0.4), transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(180,0,255,0.5), transparent 40%);
          animation: auroraMove 10s ease-in-out infinite alternate;
        }
        @keyframes auroraMove {
          0% { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.1) translate(-20px,20px); }
        }
        .balloon {
          position:absolute;
          bottom:-10%;
          font-size: 2rem;
          animation: floatUp 8s linear infinite;
        }
        .heart {
          position:absolute;
          bottom:-10%;
          font-size: 1.6rem;
          animation: floatUp 7s ease-in infinite;
        }
        @keyframes floatUp {
          to { transform: translateY(-120vh); opacity: 0; }
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10%;
          animation: confettiFall 3s ease-out forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        .firework {
          pointer-events: none;
          z-index: 9999;
        }
        canvas {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>

    </div>
  );
}