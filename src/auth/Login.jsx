import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    setSuccess("Login successful.");
  };

  return (
    <div className="min-h-screen bg-[#f5f3f7] px-4 py-8">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">

<<<<<<< HEAD
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex items-end gap-1">
                <span className="h-7 w-2 bg-[#a100ff]" />
                <span className="h-10 w-2 bg-[#7500c0]" />
                <span className="h-14 w-2 bg-[#460073]" />
              </div>
            </div>

            <p className="text-sm font-medium tracking-wide text-[#7500c0]">
              3S APPLICATION
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2b2b2b]">
=======
          {/* Header with 3S Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src="/logo.png"
                alt="3S Logo"
                className="h-20 w-20 object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#2b2b2b]">
>>>>>>> 579c4c6 (feat: add manage team members card, registration navigation, and updated logo)
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue to your account.
            </p>
          </div>

          {/* Login Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="h-1.5 bg-[#a100ff]" />

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} noValidate>

                {/* Error */}
                {error && (
                  <div
                    className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div
                    className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3.5 text-sm text-green-700"
                    role="status"
                  >
                    {success}
                  </div>
                )}

                {/* Email */}
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email ID
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                {/* Password */}
                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    {/* Password visibility button */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-[#7500c0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? (
                        /* Eye Off */
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3l18 18"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.58 10.58a2 2 0 102.83 2.83"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 8.5 4 9.5 8a11.7 11.7 0 01-2.06 3.74"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6.61 6.61C4.65 7.83 3.29 9.63 2.5 12c.59 1.77 1.64 3.27 3.11 4.5C7.09 17.7 9.22 20 12 20c1.2 0 2.32-.3 3.36-.82"
                          />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="mb-6 text-right">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#7500c0] hover:text-[#5f0099] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7500c0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f0099] focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Authorized team members only
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;