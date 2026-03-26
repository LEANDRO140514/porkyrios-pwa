"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <div className="bg-red-100 p-4 rounded-full inline-block">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Error Critico
            </h1>
            
            <p className="text-gray-700 mb-4">
              La aplicacion encontro un error critico.
            </p>
            
            {error.digest && (
              <p className="text-xs text-gray-500 mb-4">
                ID de error: {error.digest}
              </p>
            )}
            
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-bold hover:bg-[#FF8E53] transition-colors"
            >
              Reiniciar aplicacion
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
