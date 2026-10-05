import { useState } from "react";
import { supabase } from "../lib/supabase";

function ChangePassword({ onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validatePassword = () => {
    if (!newPassword) {
      return "New password is required.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (newPassword.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1: Make sure we have an authenticated user
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Unable to get authenticated user:",
          userError
        );

        setError(
          "Your session is no longer valid. Please log in again."
        );

        return;
      }

      console.log("Authenticated user:", user.id);

      /*
       * STEP 2: Update password in Supabase Auth
       */

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (passwordError) {
        console.error(
          "Password update failed:",
          passwordError
        );

        setError(
          passwordError.message ||
            "Unable to update password. Please try again."
        );

        return;
      }

      console.log("Password updated successfully.");

      /*
       * STEP 3: Find the team member profile
       */

      const { data: profile, error: profileFetchError } =
        await supabase
          .from("team_members")
          .select(
            "id, auth_user_id, role, must_change_password"
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (profileFetchError) {
        console.error(
          "Profile lookup failed:",
          profileFetchError
        );

        setError(
          `Password was changed, but your profile could not be loaded: ${profileFetchError.message}`
        );

        return;
      }

      if (!profile) {
        console.error(
          "No team member profile found for auth user:",
          user.id
        );

        setError(
          "Password was changed, but your team member profile could not be found. Please contact the administrator."
        );

        return;
      }

      console.log("Team member profile:", profile);

      /*
       * STEP 4: Mark temporary-password requirement as completed
       */

      const { error: profileUpdateError } =
        await supabase
          .from("team_members")
          .update({
            must_change_password: false,
          })
          .eq("id", profile.id);

      if (profileUpdateError) {
        console.error(
          "Profile update failed:",
          profileUpdateError
        );

        setError(
          `Password was changed successfully, but your profile could not be updated: ${profileUpdateError.message}`
        );

        return;
      }

      console.log(
        "must_change_password updated successfully."
      );

      /*
       * STEP 5: Success
       */

      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Password changed successfully. Redirecting..."
      );

      setTimeout(() => {
        onPasswordChanged();
      }, 800);
    } catch (unexpectedError) {
      console.error(
        "Unexpected password change error:",
        unexpectedError
      );

      setError(
        unexpectedError?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

            <h1 className="text-3xl font-semibold tracking-tight text-[#2b2b2b]">
              Create Your Password
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Please create a new password before continuing.
            </p>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">

            <div className="h-1.5 bg-[#a100ff]" />

            <div className="p-6 sm:p-8">

              {/* Error */}
              {error && (
                <div
                  className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>

                  <div>
                    <p className="font-medium">
                      Unable to change password
                    </p>

                    <p className="mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div
                  className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                  role="status"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  <div>
                    <p className="font-medium">
                      Password updated
                    </p>

                    <p className="mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* New Password */}
                <div className="mb-5">
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        setError("");
                        setSuccessMessage("");
                      }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    {/* Show / Hide New Password */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-[#7500c0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showNewPassword ? (
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

                {/* Confirm Password */}
                <div className="mb-3">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        );
                        setError("");
                        setSuccessMessage("");
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    {/* Show / Hide Confirm Password */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-[#7500c0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
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

                {/* Password requirements */}
                <div className="mb-6 rounded-md bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700">
                    Password requirements
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    • At least 8 characters
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    loading || Boolean(successMessage)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7500c0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f0099] focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />

                      Updating Password...
                    </>
                  ) : successMessage ? (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>

                      Password Updated
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-500">
            Your temporary password can no longer be used after
            this change.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;