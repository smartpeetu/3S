function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3f7]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e6d5ef] border-t-[#7500c0]" />

        <p className="text-sm font-medium text-gray-600">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default AuthLoading;