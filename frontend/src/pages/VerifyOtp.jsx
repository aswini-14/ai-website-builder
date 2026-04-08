import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    const userId = localStorage.getItem("fp_userId");

    if (!userId) {
        navigate("/forgot-password");
    }
  }, [navigate]);

  /* ⏳ TIMER */
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  /* ✅ VERIFY OTP */
  const handleVerify = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, otp })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("resetToken", data.resetToken);
      navigate("/reset-password");

    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔁 RESEND OTP */
  const handleResend = async () => {
    setError("");

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (!res.ok) return setError("Failed to resend OTP");

    setTimer(300);
    setCanResend(false);
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
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Verify OTP
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Enter the code sent to your email
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

          {/* OTP Input */}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="
              w-full px-4 py-3
              border-2 border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-800 dark:text-gray-100
              placeholder-gray-400
              rounded-xl
              focus:border-indigo-500
              focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
              outline-none transition-all mb-4
            "
          />

          {/* Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || !otp}
            className="
              w-full py-3
              bg-gradient-to-r from-indigo-600 to-purple-600
              text-white font-semibold
              rounded-xl shadow-lg hover:shadow-xl
              disabled:opacity-50
              transition-all hover:scale-[1.02] active:scale-95
              flex items-center justify-center gap-2 mb-4
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Timer */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            OTP expires in:{" "}
            <span className="font-bold text-indigo-600">
              {formatTime()}
            </span>
          </p>

          {/* Resend */}
          <div className="text-center mt-4">
            {canResend ? (
              <button
                onClick={handleResend}
                className="flex items-center justify-center gap-2 mx-auto text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Resend available after timer
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;