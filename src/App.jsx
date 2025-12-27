import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {

  // 🔁 CHANGE TO false ON REAL BIRTHDAY
  const TEST_MODE = false; // true = 10 sec test | false = real date

  const [stage, setStage] = useState("countdown");
  const [timeLeft, setTimeLeft] = useState(null);
  const musicRef = useRef(null);

  // ⏳ COUNTDOWN LOGIC
  useEffect(() => {
    const target = TEST_MODE
  ? new Date(Date.now() + 10 * 1000)
  : new Date(2026, 9, 9, 0, 0, 0); // ✅ 9 Oct 12:00 AM IST


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

            <button
              onClick={() => {
                musicRef.current.volume = 0.4;
                musicRef.current.play();
                setStage("question");
              }}
              className="px-12 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-500
                         text-white rounded-full text-xl shadow-lg hover:scale-105 transition"
            >
              Let’s Celebrate 🎂
            </button>
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
              😏 Itna aasani se nahi bach paayega bhai!
            </p>

            <button
              onClick={() => setStage("preview")}
              className="px-8 py-3 bg-yellow-400 rounded-full
                         text-lg hover:scale-105 transition"
            >
              Accha dikha de 😭
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
              Have a look at it, Bhai!!! ✨
            </h2>

            <button
              onClick={() => setStage("cake")}
              className="px-12 py-4 bg-white text-pink-600
                         rounded-full text-xl hover:scale-110 transition"
            >
              Let’s Go 🚀
            </button>
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

            {[...Array(45)].map((_, i) => (
              <span key={`b${i}`} className="balloon"
                style={{ left: `${Math.random() * 100}%` }}>🎈</span>
            ))}

            {[...Array(50)].map((_, i) => (
              <span key={`h${i}`} className="heart"
                style={{ left: `${Math.random() * 100}%` }}>💖</span>
            ))}

            <div className="text-center z-10">
              <div className="w-56 h-16 bg-pink-200 rounded-t-3xl mx-auto"></div>
              <div className="w-64 h-18 bg-pink-300 rounded-3xl -mt-4 mx-auto"></div>
              <div className="w-72 h-24 bg-pink-400 rounded-3xl -mt-4
                              flex items-center justify-center text-3xl shadow-xl">
                🎂
              </div>

              <button
                onClick={() => setStage("final")}
                className="mt-10 px-10 py-4 bg-white text-pink-600
                           rounded-full text-lg hover:scale-110 transition"
              >
                Continue 💌
              </button>
            </div>
          </motion.div>
        )}

        {/* 💖 FINAL MESSAGE */}
        {stage === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl px-14 py-12 text-center max-w-xl"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              This isn’t just a surprise…  
              <br />
              it’s a small way of saying  
              <br />
              <span className="text-pink-500 font-semibold">
                you matter more than you know 💗
              </span>
              <br /><br />
              Happy Birthday 🎉
            </p>
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
      `}</style>

    </div>
  );
}