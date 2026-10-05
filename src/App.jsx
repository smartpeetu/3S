import Login from "./auth/Login";
import AuthLoading from "./auth/AuthLoading";
import ChangePassword from "./auth/changePassword";
import HomePage from "./components/HomePage";
import { useAuth } from "./auth/useAuth";

function AppContent() {
  const {
    session,
    profile,
    loading,
    profileLoading,
    refreshProfile,
  } = useAuth();

  // --------------------------------------------------
  // 1. Authentication is still being initialized
  // --------------------------------------------------

  if (loading) {
    return <AuthLoading />;
  }

  // --------------------------------------------------
  // 2. No authenticated session
  // --------------------------------------------------

  if (!session) {
    return <Login />;
  }

  // --------------------------------------------------
  // 3. Session exists, but profile is still loading
  // --------------------------------------------------

  if (profileLoading) {
    return <AuthLoading />;
  }

  // --------------------------------------------------
  // 4. Session exists but no team member profile exists
  // --------------------------------------------------

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f3f7] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Profile not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Your authenticated account is not linked to a team member
            profile. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // 5. User must change temporary password
  // --------------------------------------------------

  if (profile.must_change_password) {
    return (
      <ChangePassword
        onPasswordChanged={refreshProfile}
      />
    );
  }

  // --------------------------------------------------
  // 6. Normal authenticated application
  // --------------------------------------------------

  return <HomePage />;
}

function App() {
  return <AppContent />;
}

export default App;