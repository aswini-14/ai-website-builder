import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: "Weak", color: "bg-red-500" },
      { strength: 2, label: "Fair", color: "bg-orange-500" },
      { strength: 3, label: "Good", color: "bg-yellow-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" }
    ];

    return levels[strength - 1] || { strength: 0, label: "", color: "" };
  };

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const strength = passwordStrength();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-indigo-50 via-white to-purple-50
        dark:from-gray-900 dark:via-gray-950 dark:to-black
        flex items-center justify-center px-6 py-12
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Start building amazing websites
          </p>
        </div>

        {/* Card */}
        <div className="
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          rounded-3xl shadow-xl
          p-8 transition-colors duration-300
        ">

          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />

              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="
                  w-full pl-12 pr-4 py-3
                  border-2 border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  rounded-xl
                  focus:border-indigo-500
                  focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                  outline-none transition-all
                "
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                className="
                  w-full pl-12 pr-4 py-3
                  border-2 border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  rounded-xl
                  focus:border-indigo-500
                  focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                  outline-none transition-all
                "
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="
                  w-full pl-12 pr-12 py-3
                  border-2 border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  rounded-xl
                  focus:border-indigo-500
                  focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                  outline-none transition-all
                "
              />

              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Strength */}
          {password && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Password Strength
                </span>
                <span
                  className={`text-xs font-semibold ${
                    strength.strength === 4
                      ? "text-green-500"
                      : strength.strength === 3
                      ? "text-yellow-500"
                      : strength.strength === 2
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  {strength.label}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                  style={{ width: `${(strength.strength / 4) * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Use 8+ characters with letters, numbers & symbols
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="
              mb-5 p-4
              bg-red-50 dark:bg-red-900/30
              border border-red-200 dark:border-red-800
              rounded-xl flex items-start gap-3
            ">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleRegister}
            disabled={isLoading || !name || !email || !password}
            className="
              w-full py-3
              bg-gradient-to-r from-indigo-600 to-purple-600
              text-white font-semibold
              rounded-xl shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all hover:scale-[1.02] active:scale-95
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          By creating an account, you agree to our{" "}
          <button className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;