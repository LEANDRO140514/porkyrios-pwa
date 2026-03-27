"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient, useSession } from "@/lib/auth-client";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show success message if coming from registration
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("¡Cuenta creada exitosamente! Ahora inicia sesión.");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      const redirect = searchParams.get("redirect") || "/menu";
      router.push(redirect);
    }
  }, [session, sessionLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error?.code) {
        toast.error("Email o contraseña incorrectos. Verifica que ya hayas registrado una cuenta e intenta nuevamente.");
        setIsLoading(false);
        return;
      }

      toast.success("¡Bienvenido de vuelta!");
      
      // Redirect to intended page or menu
      const redirect = searchParams.get("redirect") || "/menu";
      router.push(redirect);
    } catch (err) {
      toast.error("Error al iniciar sesión. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] flex items-center justify-center">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
      </div>
    );
  }

  const redirectUrl = searchParams.get("redirect") || "/menu";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-md">
        {/* Back Button - Optimizado Mobile First */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-white hover:bg-white/10 mb-4 md:mb-6 text-sm md:text-base h-9 md:h-10"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Volver al inicio
        </Button>

        {/* Login Card - Optimizado Mobile First */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative w-20 h-20 md:w-24 md:h-24 cursor-pointer" onClick={() => router.push("/")}>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                alt="Porkyrios Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-1 md:mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Inicia sesión para continuar con tu pedido
          </p>

          {/* Social Login Buttons */}
          <SocialLoginButtons redirectUrl={redirectUrl} mode="login" />

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  className="h-10 md:h-12 text-sm md:text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-xs md:text-sm text-gray-600 cursor-pointer"
              >
                Recordarme
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white h-11 md:h-12 text-base md:text-lg font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-5 md:mt-6 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-[#FF6B35] font-bold hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}