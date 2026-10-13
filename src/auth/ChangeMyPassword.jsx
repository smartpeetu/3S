import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

function ChangeMyPassword({ onBack }) {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!currentPassword) {
      return "Please enter your current password.";
    }

    if (!newPassword) {
      return "Please enter your new password.";
    }

    if (!confirmPassword) {
      return "Please confirm your new password.";
    }

    if (newPassword.length < 8) {
      return "Your new password must contain at least 8 characters.";
    }

    if (newPassword !== confirmPassword) {
      return "The new passwords do not match.";
    }

    if (currentPassword === newPassword) {
      return "Your new password must be different from your current password.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user?.email) {
      setError(
        "Your account information could not be verified. Please log in again."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1: Verify the current password.
       *
       * Supabase's updateUser() does not accept the current
       * password as a parameter. We verify it by signing in
       * with the user's existing email and password first.
       */

      const { error: verificationError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (verificationError) {
        setError(
          "Your current password is incorrect. Please try again."
        );
        return;
      }

      /*
       * STEP 2: Update the password through Supabase Auth.
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
            "Unable to update your password. Please try again."
        );
        return;
      }

      /*
       * STEP 3: Show success.
       */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Your password has been changed successfully."
      );
    } catch (unexpectedError) {
      console.error(
        "Unexpected password change error:",
        unexpectedError
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-3.5 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:cursor-not-allowed disabled:bg-gray-100";

  const renderPasswordField = ({
    id,
    label,
    value,
    onChange,
    visible,
    setVisible,
    placeholder,
    autoComplete,
  }) => (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setError("");
            setSuccessMessage("");
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={loading}
          className={inputClassName}
          required
        />

        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          disabled={loading}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 hover:text-[#7500c0] disabled:opacity-50"
        >
          {visible ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.9 10.9 0 0112 4c5 0 8.5 4 9.5 8a11.7 11.7 0 01-2.1 3.7M6.6 6.6C4.6 7.8 3.3 9.6 2.5 12c1.4 4.2 5 8 9.5 8 1.2 0 2.3-.3 3.4-.8"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
  );

  return (
    <div className="min-h-screen bg-[#f5f3f7] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="3S Logo"
              className="h-9 w-9 object-contain"
            />

            <div>
              <p className="font-bold text-gray-900">3S</p>
              <p className="text-xs text-gray-500">
                Account Security
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#7500c0] hover:text-[#7500c0]"
          >
            Back
          </button>
        </header>

        {/* Title */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7500c0]">
            Security Settings
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            Change My Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Verify your current password and choose a new one
            to protect your account.
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#7500c0]" />

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6 sm:p-8"
          >
            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            {renderPasswordField({
              id: "currentPassword",
              label: "Current Password",
              value: currentPassword,
              onChange: setCurrentPassword,
              visible: showCurrentPassword,
              setVisible: setShowCurrentPassword,
              placeholder: "Enter your current password",
              autoComplete: "current-password",
            })}

            {renderPasswordField({
              id: "newPassword",
              label: "New Password",
              value: newPassword,
              onChange: setNewPassword,
              visible: showNewPassword,
              setVisible: setShowNewPassword,
              placeholder: "Enter your new password",
              autoComplete: "new-password",
            })}

            {renderPasswordField({
              id: "confirmNewPassword",
              label: "Confirm New Password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              visible: showConfirmPassword,
              setVisible: setShowConfirmPassword,
              placeholder: "Re-enter your new password",
              autoComplete: "new-password",
            })}

            {/* Requirements */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700">
                Password requirements
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your new password must contain at least 8 characters.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || Boolean(successMessage)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7500c0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f0099] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating Password...
                </>
              ) : successMessage ? (
                "Password Updated"
              ) : (
                "Update Password"
              )}
            </button>

          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Your password is managed securely by Supabase Auth.
        </p>
      </div>
    </div>
  );
}

export default ChangeMyPassword;