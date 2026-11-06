"use client";

import { useEffect } from "react";
import { WebGLShaderBackground } from "@/components/webgl-shader-background";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
    }
  }, [error]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <WebGLShaderBackground className="fixed inset-0 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">500</h1>
        <p className="text-xl md:text-2xl text-white/80 mb-4">
          Something went wrong!
        </p>
        <p className="text-sm text-white/60 mb-8">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={reset}
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
