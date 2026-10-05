import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthStateChange = async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery session established.");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      console.error("Password reset failed:", updateError);
      setError("Unable to reset your password. Please try again.");
      return;
    }

    setPassword("");
    setConfirmPassword("");

    setSuccess(
      "Your password has been updated successfully. You can now log in."
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
              Create New Password
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Enter a new password for your account.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              role="alert"
            >
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
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
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          )}

          {success && (
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="mt-4 w-full rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;