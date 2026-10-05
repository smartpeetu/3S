import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    const { error: loginError } = await supabase.auth.signInWithPassword({
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

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
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