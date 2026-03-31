import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("fp_userId");

    if (!userId) {
        navigate("/forgot-password");
    }
  }, []);
  const handleReset = async () => {
    setError("");

    if (!password || !confirmPassword) {
      return setError("Please fill all fields");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("resetToken")}`
        },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      navigate("/");

    } catch {
      setError("Something went wrong");
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
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
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

          {/* New Password */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full pl-12 pr-12 py-3
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

              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="
                  w-full pl-12 pr-12 py-3
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

              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleReset}
            disabled={isLoading || !password || !confirmPassword}
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
                Updating...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          {/* Back */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
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

export default ResetPassword;