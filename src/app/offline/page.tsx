import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#FF6B35] rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Sin Conexión
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          No tienes conexión a Internet. Por favor verifica tu conexión e intenta nuevamente.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-lg py-6 h-auto"
          >
            Reintentar
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10 text-lg py-6 h-auto"
            >
              Volver al Inicio
            </Button>
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Algunas páginas pueden estar disponibles sin conexión
        </p>
      </div>
    </div>
  );
}
