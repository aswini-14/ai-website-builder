import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, Loader2, Sparkles } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      return setError("Please enter your email");
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("fp_userId", data.userId);
      localStorage.setItem("fp_email", email);

      navigate("/verify-otp", {
        state: {
          userId: data.userId,
          email: email
        }
      });

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen 
      bg-gradient-to-br 
      from-indigo-50 via-white to-purple-50
      dark:from-gray-900 dark:via-gray-950 dark:to-black
      flex items-center justify-center px-6 py-12
    ">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Forgot Password
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to receive an OTP
          </p>
        </div>

        {/* Card */}
        <div className="
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          rounded-3xl shadow-xl
          p-8
        ">

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

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full pl-12 pr-4 py-3
                  border-2 border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-100
                  placeholder-gray-400
                  rounded-xl
                  focus:border-indigo-500
                  focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                  outline-none transition-all
                "
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              w-full py-3
              bg-gradient-to-r from-indigo-600 to-purple-600
              text-white font-semibold
              rounded-xl shadow-lg hover:shadow-xl
              disabled:opacity-50
              transition-all hover:scale-[1.02] active:scale-95
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </button>

          {/* Back */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;