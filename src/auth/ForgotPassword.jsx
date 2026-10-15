function ForgotPassword({ onBack }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3f7] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="h-1.5 bg-[#a100ff]" />

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[#7500c0]">
              3S APPLICATION
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[#2b2b2b]">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              If you cannot access your account, contact your
              3S administrator to request a password reset.
            </p>
          </div>

          {/* Information */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7500c0]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M10.3 3.9l-7.8 13.5A2 2 0 004.2 20h15.6a2 2 0 001.7-2.6l-7.8-13.5a2 2 0 00-3.4 0z"
                />
              </svg>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Administrator assistance required
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Your administrator will verify your identity
                  and initiate a password reset. You will need
                  to create a new password when you next log in.
                </p>
              </div>
            </div>
          </div>

          {/* Recovery instructions */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-[#7500c0]">
                1
              </div>

              <p className="text-sm leading-6 text-gray-600">
                Contact your authorized 3S administrator
                through your organization's approved channel.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-[#7500c0]">
                2
              </div>

              <p className="text-sm leading-6 text-gray-600">
                Complete the required identity verification.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-[#7500c0]">
                3
              </div>

              <p className="text-sm leading-6 text-gray-600">
                Follow the administrator's instructions to
                regain access to your account.
              </p>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            className="mt-8 w-full rounded-md bg-[#7500c0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f0099] focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;