"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53]">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Algo salió mal!
        </h2>
        
        <p className="text-gray-600 mb-4">
          Lo sentimos, ocurrió un error inesperado.
        </p>
        
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 font-mono">{error.message}</p>
          </div>
        )}
        
        {error.digest && (
          <p className="text-xs text-gray-500 mb-4">
            ID de error: {error.digest}
          </p>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
          
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
