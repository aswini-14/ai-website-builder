import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  RefreshCcw
} from "lucide-react";

const words = ["Build", "Design", "Launch"];

function Home() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

useEffect(() => {
  let index = 0;
  let isDeleting = false;
  let timeout;

  const type = () => {
    const currentWord = words[i];

    if (!isDeleting) {
      // Typing
      setText(currentWord.slice(0, index));
      index++;

      if (index <= currentWord.length) {
        timeout = setTimeout(type, 260);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 1500);
      }

    } else {
      // Deleting
      index--;
      setText(currentWord.slice(0, index));

      if (index >= 0) {
        timeout = setTimeout(type, 120);
      } else {
        // Move to next word
        isDeleting = false;
        setI((prev) => (prev + 1) % words.length);
      }
    }
  };

  type();

  return () => clearTimeout(timeout);
}, [i]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 120]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-800 dark:text-gray-100 overflow-x-hidden">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold text-indigo-600">AI Code Builder</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate("/login")}>Login</button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Register
          </button>
        </div>
      </div>

      {/* HERO */}
      <motion.div style={{ y }} className="text-center py-32 px-6 relative">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-[500px] h-[600px] bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          {text} Websites with AI
        </h1>

        <p className="text-lg max-w-3xl mx-auto mb-6 text-gray-600 dark:text-gray-400">
          Transform ideas into fully functional websites instantly using prompts,
          Figma designs, templates, or voice commands.
        </p>

        <p className="text-sm text-gray-500 mb-10">
          Prompt • Figma • Templates • Voice → Generate → Refine → Deploy
        </p>

        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
          >
            Generate Website
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/register")}
            className="px-8 py-3 bg-white/60 dark:bg-white/10 rounded-xl border"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* FEATURES */}
      <div className="px-10 pb-24 grid md:grid-cols-4 gap-6">
        {[
          {
            icon: <Sparkles />,
            title: "AI Website Generation",
            desc: "Convert prompts into structured, production-ready code using intelligent processing."
          },
          {
            icon: <Wand2 />,
            title: "Smart Refinement",
            desc: "Modify only specific sections without affecting the full design."
          },
          {
            icon: <RefreshCcw />,
            title: "Undo / Redo",
            desc: "Navigate across multiple versions with full control."
          },
          {
            icon: <Download />,
            title: "Code Ownership",
            desc: "Download complete source code and deploy anywhere."
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border"
          >
            <div className="text-indigo-600 mb-3">{item.icon}</div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div className="px-10 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works ⚡</h2>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            "Input Prompt / Figma / Voice",
            "Convert to SIR",
            "Generate Code",
            "Refine Changes",
            "Preview & Deploy"
          ].map((step, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 border">
              <p className="font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="px-10 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          See It In Action 🎯
        </h2>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="
            rounded-2xl overflow-hidden
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            max-w-3xl mx-auto
            bg-black
          "
        >

          {/* Glow Border */}
          <div className="p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
            
            <div className="bg-black rounded-2xl overflow-hidden">

              {/* IMAGE */}
              <img
                src={isDark ? "/Sample(Dark).png" : "/Sample (Light).png"}
                alt="Website Preview"
                className="
                  w-full
                  object-contain
                  rounded-2xl
                  transition duration-500
                  hover:scale-105
                "
              />

            </div>
          </div>

        </motion.div>

        {/* Extra Text */}
        <p className="text-center text-gray-500 mt-6">
          Real-time preview updates instantly with every refinement request
        </p>
      </div>

      {/* ADVANCED FEATURES */}
      <div className="px-10 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Powerful Features 💎
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Voice Input Support",
            "Code Explanation Engine",
            "Figma to Website",
            "Project History Views",
            "Template Library",
            "One Click Deployment"
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 border">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* WHY SECTION */}
      <div className="px-10 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Why Choose AI Builder?
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          {[
            "Eliminates manual frontend coding",
            "Maintains consistency during refinement",
            "Full control over generated code",
            "Bridges design & development",
            "Supports both beginners and developers",
            "Accelerates prototyping"
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/60 dark:bg-white/10 rounded-xl border">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ARCHITECTURE */}
      <div className="px-10 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Powered by Intelligent Architecture 🔬
        </h2>

        <p className="max-w-3xl mx-auto text-gray-500">
          Inputs are converted into Structured Intermediate Representation (SIR),
          enabling accurate generation, controlled refinement, and minimal unintended changes.
        </p>
      </div>

      {/* USERS */}
      <div className="px-10 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Designed for Everyone 🌍
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            "Beginners",
            "Developers",
            "Designers"
          ].map((u, i) => (
            <div key={i} className="p-6 bg-white/60 dark:bg-white/10 rounded-2xl border">
              {u}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-32">
        <h2 className="text-4xl font-bold mb-6">
          Build. Refine. Launch 🚀
        </h2>

        <p className="mb-6 text-gray-500">
          Create production-ready websites in minutes — no complexity.
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/register")}
          className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl"
        >
          Get Started Free
        </motion.button>
      </div>

    </div>
  );
}

export default Home;