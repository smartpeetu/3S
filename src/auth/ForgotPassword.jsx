import { useState } from "react";
import { supabase } from "../lib/supabase";

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    setLoading(false);

    if (resetError) {
      console.error("Password reset request failed:", resetError);
    }

    // Deliberately show the same message regardless of whether
    // the email exists.
    setMessage(
      "If an account exists for this email address, you will receive password-reset instructions."
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3f7] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="h-1.5 bg-[#a100ff]" />

        <div className="p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[#7500c0]">
              3S APPLICATION
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[#2b2b2b]">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Enter your registered email address and we will send you
              password-reset instructions.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-[#7500c0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f0099] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 w-full rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;