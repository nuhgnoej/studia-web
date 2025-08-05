// components/LoadingIndicator.tsx
"use client";

export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-gray-500" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
