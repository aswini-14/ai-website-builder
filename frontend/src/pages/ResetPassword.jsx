import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError("");

    if (!password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, newPassword: password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleReset();
  };

  /* ===============================
      SUCCESS STATE
  =============================== */

  if (success) {
    return (
      <div
        className="
          min-h-screen
          bg-gradient-to-br
          from-indigo-50 via-white to-purple-50
          dark:from-gray-900 dark:via-gray-950 dark:to-black
          flex items-center justify-center px-6
          transition-colors duration-300
        "
      >
        <div
          className="
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-3xl shadow-xl
            p-8 max-w-md w-full text-center
          "
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Password Reset Successful!
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
      MAIN FORM
  =============================== */

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-indigo-50 via-white to-purple-50
        dark:from-gray-900 dark:via-gray-950 dark:to-black
        flex items-center justify-center px-6
        transition-colors duration-300
      "
    >
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Card */}
        <div
          className="
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-3xl shadow-xl
            p-8 transition-all hover:shadow-2xl
          "
        >

          {error && (
            <div
              className="
                mb-6 p-4
                bg-red-50 dark:bg-red-900/30
                border border-red-200 dark:border-red-800
                rounded-xl flex items-start gap-3
              "
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-red-800 dark:text-red-300 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="
                  w-full px-4 py-3 pr-12
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
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="
                  w-full px-4 py-3 pr-12
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
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="
              w-full px-8 py-3
              bg-gradient-to-r from-indigo-600 to-purple-600
              text-white font-semibold
              rounded-xl shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all hover:scale-105 active:scale-95
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Reset Password
              </>
            )}
          </button>

          {/* Back */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;