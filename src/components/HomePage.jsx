import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import TeamMemberForm from "./TeamMemberForm";
import TeamMembersList from "./TeamMembersList";

function HomePage() {
  const {
    profile,
    user,
    logout,
  } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // --------------------------------------------------
  // USER INFORMATION
  // --------------------------------------------------

  const userName =
    profile?.name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const email =
    user?.email ||
    profile?.email ||
    "Not available";

  const role = profile?.role || "User";

  const isAdmin = role.toLowerCase() === "admin";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  // ==================================================
  // ADD TEAM MEMBER SCREEN
  // ==================================================

  if (showTeamMemberForm) {
    return (
      <div className="min-h-screen bg-[#f5f3f7]">

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            {/* Brand */}
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.png"
                alt="3S Logo"
                className="h-8 w-8 object-contain"
              />

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  3S
                </p>

                <p className="hidden text-xs text-gray-500 sm:block">
                  Team Workspace
                </p>
              </div>

            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => setShowTeamMemberForm(false)}
              className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#7500c0] hover:text-[#7500c0] hover:shadow-sm sm:px-4"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              <span>Back</span>
            </button>

          </div>
        </header>

        {/* Form */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7500c0]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Add Team Member
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Create a team member profile and assign their application
              access.
            </p>
          </div>

          <TeamMemberForm />

        </main>
      </div>
    );
  }

  // ==================================================
  // HISTORY OF RECORDS SCREEN (ADMIN ONLY)
  // ==================================================

  if (showHistory && isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f3f7]">

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            {/* Brand */}
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.png"
                alt="3S Logo"
                className="h-8 w-8 object-contain"
              />

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  3S
                </p>

                <p className="hidden text-xs text-gray-500 sm:block">
                  Manage Team Members
                </p>
              </div>

            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#7500c0] hover:text-[#7500c0] hover:shadow-sm sm:px-4"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              <span>Back</span>
            </button>

          </div>
        </header>

        {/* Records Content */}
        <TeamMembersList onBack={() => setShowHistory(false)} />
      </div>
    );
  }

  // ==================================================
  // PROFILE SCREEN
  // ==================================================

  if (showProfile) {
    return (
      <div className="min-h-screen bg-[#f5f3f7] text-[#2b2b2b]">

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            {/* Brand */}
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.png"
                alt="3S Logo"
                className="h-8 w-8 object-contain"
              />

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  3S
                </p>

                <p className="hidden text-xs text-gray-500 sm:block">
                  My Profile
                </p>
              </div>

            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#7500c0] hover:text-[#7500c0] hover:shadow-sm sm:px-4"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              <span>Back</span>
            </button>

          </div>
        </header>

        {/* Profile */}
        <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

          {/* Background glow */}
          <div className="pointer-events-none fixed left-0 top-20 -z-10 h-96 w-96 rounded-full bg-[#a100ff]/10 blur-3xl" />

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7500c0]">
              Profile
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View your team member information.
            </p>
          </div>

          {/* Profile Card */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

            {/* Profile Hero */}
            <div className="relative overflow-hidden bg-[#2b2b2b] px-6 py-8 text-white sm:px-10 sm:py-10">

              <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#a100ff]/25 blur-3xl" />

              <div className="pointer-events-none absolute right-10 top-0 hidden h-[400px] w-2 rotate-[25deg] bg-[#a100ff]/30 sm:block" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[#7500c0] text-2xl font-bold shadow-xl shadow-purple-950/30">
                  {initials}
                </div>

                <div className="min-w-0">

                  <h2 className="break-words text-2xl font-semibold sm:text-3xl">
                    {userName}
                  </h2>

                  <p className="mt-1 break-all text-sm text-gray-300">
                    {email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <span className="inline-flex rounded-full bg-[#a100ff]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#d99cff]">
                      {role}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      Active
                    </span>

                  </div>
                </div>

              </div>
            </div>

            {/* Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2">

              {/* Name */}
              <ProfileField
                label="Name"
                value={profile?.name}
              />

              {/* Email */}
              <ProfileField
                label="Email"
                value={email}
              />

              {/* Location */}
              <ProfileField
                label="Location"
                value={profile?.location}
              />

              {/* Career Level */}
              <ProfileField
                label="Career Level"
                value={profile?.career_level}
              />

              {/* Primary Skill */}
              <ProfileField
                label="Primary Skill"
                value={profile?.primary_skill}
              />

              {/* Secondary Skill */}
              <ProfileField
                label="Secondary Skill"
                value={profile?.secondary_skill}
              />

              {/* Role */}
              <div className="border-b border-gray-100 p-6 sm:border-r">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                  Role
                </p>

                <span className="mt-3 inline-flex rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#7500c0]">
                  {role}
                </span>
              </div>

              {/* Status */}
              <div className="border-b border-gray-100 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                  Account Status
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                  <span className="text-sm font-semibold text-green-700">
                    Active
                  </span>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    );
  }

  // ==================================================
  // MAIN HOME PAGE
  // ==================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f3f7] text-[#2b2b2b]">

      {/* ============================================================= */}
      {/* BACKGROUND                                                     */}
      {/* ============================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#a100ff]/10 blur-3xl" />

        <div className="absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-[#7500c0]/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-300/10 blur-3xl" />

      </div>

      {/* ============================================================= */}
      {/* NAVBAR                                                         */}
      {/* ============================================================= */}

      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/logo.png"
              alt="3S Logo"
              className="h-9 w-9 object-contain"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold tracking-wide text-gray-900">
                3S
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                Team Workspace
              </p>
            </div>

          </div>

          {/* User menu */}
          <div className="relative flex-shrink-0">

            <button
              type="button"
              onClick={() => setShowMenu((value) => !value)}
              aria-expanded={showMenu}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pr-2.5 shadow-sm transition hover:border-[#7500c0] hover:shadow-md sm:gap-3"
            >

              {/* Avatar */}
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#7500c0] text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                {initials}
              </div>

              {/* User information */}
              <div className="hidden min-w-0 text-left md:block">

                <p className="max-w-[140px] truncate text-sm font-semibold text-gray-800">
                  {userName}
                </p>

                <p className="text-xs font-medium text-[#7500c0]">
                  {role}
                </p>

              </div>

              <svg
                className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${
                  showMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-3 w-[280px] max-w-[calc(100vw-2rem)] origin-top-right animate-[menuIn_0.15s_ease-out] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                {/* User */}
                <div className="border-b border-gray-100 bg-gray-50/80 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#7500c0] text-sm font-bold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-gray-900">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {email}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7500c0]">
                        {role}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Menu */}
                <div className="p-2">

                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-purple-50 hover:text-[#7500c0]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>

                    <div>
                      <p>My Profile</p>
                      <p className="text-xs font-normal text-gray-400">
                        View your information
                      </p>
                    </div>
                  </button>

                  {/* History of Records (Admin Only) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowHistory(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-purple-50 hover:text-[#7500c0]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <p>Manage Team Members</p>
                        <p className="text-xs font-normal text-gray-400">
                          View &amp; manage directory
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Session */}
                  <div className="mt-1 rounded-xl px-3 py-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Session Active
                        </p>

                        <p className="text-xs text-gray-500">
                          Securely signed in
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">

                      {loggingOut ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                      ) : (
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      )}

                    </div>

                    {loggingOut ? "Signing out..." : "Sign out"}

                  </button>

                </div>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* ============================================================= */}
      {/* MAIN                                                           */}
      {/* ============================================================= */}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* =========================================================== */}
        {/* HERO                                                         */}
        {/* =========================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-[#2b2b2b] px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">

          {/* Glow */}
          <div className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#a100ff]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-48 right-20 h-[450px] w-[450px] rounded-full bg-[#7500c0]/20 blur-3xl" />

          {/* Decorative bars */}
          <div className="pointer-events-none absolute right-[-30px] top-[-80px] hidden h-[500px] w-[300px] opacity-30 sm:block">

            <div className="absolute right-32 top-0 h-[650px] w-2 rotate-[25deg] bg-[#a100ff]" />

            <div className="absolute right-20 top-0 h-[650px] w-2 rotate-[25deg] bg-[#7500c0]" />

            <div className="absolute right-8 top-0 h-[650px] w-2 rotate-[25deg] bg-[#460073]" />

          </div>

          <div className="relative max-w-3xl">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a100ff] opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c46cff]" />

              </span>

              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-200">
                {isAdmin ? "Admin Workspace" : "Team Workspace"}
              </span>

            </div>

            {/* Greeting */}
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">

              Welcome,

              <br />

              <span className="bg-gradient-to-r from-[#c46cff] to-white bg-clip-text text-transparent">
                {userName}
              </span>{" "}
              👋

            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base lg:text-lg">
              Welcome to your team workspace. Access your profile,
              manage team information, and explore the features
              available to you.
            </p>

            {/* Role */}
            <div className="mt-8 flex flex-wrap items-center gap-3">

              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">

                <svg
                  className="h-4 w-4 text-[#c46cff]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7z"
                  />
                </svg>

                <span className="text-xs font-medium text-gray-200">
                  Signed in as {role}
                </span>

              </div>

              {isAdmin && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-[#a100ff]/30 bg-[#a100ff]/10 px-3 py-2">

                  <span className="text-xs font-semibold text-[#d99cff]">
                    Administrative access
                  </span>

                </div>
              )}

            </div>

          </div>
        </section>

        {/* =========================================================== */}
        {/* QUICK ACTIONS                                                */}
        {/* =========================================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7500c0]">
              Quick Actions
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2b2b] sm:text-3xl">
              What would you like to do?
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* ======================================================= */}
            {/* ADMIN ACTION                                             */}
            {/* ======================================================= */}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowTeamMemberForm(true)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a100ff]/40 hover:shadow-xl"
              >

                {/* Shine */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7500c0] text-white shadow-lg shadow-purple-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">

                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>

                  </div>

                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#7500c0]">
                    Admin
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Team Member
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Create a new authorized team member and assign
                    their application role.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7500c0]">

                    Create member

                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>

                  </div>

                </div>
              </button>
            )}

            {/* ======================================================= */}
            {/* MANAGE TEAM MEMBERS (ADMIN ONLY)                         */}
            {/* ======================================================= */}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a100ff]/40 hover:shadow-xl"
              >

                {/* Shine */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7500c0] text-white shadow-lg shadow-purple-200 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">

                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>

                  </div>

                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#7500c0]">
                    Admin
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Team Members
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    View, filter, search, and manage all registered team members and their records.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7500c0]">

                    Manage members

                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>

                  </div>

                </div>
              </button>
            )}

            {/* ======================================================= */}
            {/* PROFILE                                                   */}
            {/* ======================================================= */}

            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a100ff]/40 hover:shadow-xl"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-[#7500c0] transition-all duration-300 group-hover:scale-110">

                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7 7z"
                  />
                </svg>

              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                My Profile
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                View your personal and professional information.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7500c0]">

                View profile

                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14m-6-6l6 6-6 6"
                  />
                </svg>

              </div>

            </button>

          </div>
        </section>

        {/* =========================================================== */}
        {/* ACCOUNT INFORMATION                                         */}
        {/* =========================================================== */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7500c0]">
              Account
            </p>

            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              Your information
            </h2>

          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            {/* Name */}
            <div className="p-6">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Name
              </p>

              <p className="mt-2 truncate text-sm font-semibold text-gray-800">
                {userName}
              </p>

            </div>

            {/* Email */}
            <div className="p-6">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                {email}
              </p>

            </div>

            {/* Role */}
            <div className="p-6">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Role
              </p>

              <span className="mt-2 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#7500c0]">
                {role}
              </span>

            </div>

          </div>
        </section>

      </main>

      {/* ============================================================= */}
      {/* FOOTER                                                         */}
      {/* ============================================================= */}

      <footer className="relative z-10 mt-8 border-t border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">

          <span>
            3S Team Workspace
          </span>

          <span className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-green-500" />

            Secure session active

          </span>

        </div>

      </footer>

      {/* ============================================================= */}
      {/* ANIMATION                                                      */}
      {/* ============================================================= */}

      <style>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

    </div>
  );
}

// ==================================================
// PROFILE FIELD COMPONENT
// ==================================================

function ProfileField({ label, value }) {
  return (
    <div className="border-b border-gray-100 p-6 sm:border-r">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>

      <p className="mt-3 break-words text-sm font-semibold text-gray-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default HomePage;