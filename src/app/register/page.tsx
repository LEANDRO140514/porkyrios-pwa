"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

type ErrorTypes = Partial<Record<keyof typeof authClient.$ERROR_CODES, string>>;
const errorCodes = {
  USER_ALREADY_EXISTS: "Este email ya está registrado",
} satisfies ErrorTypes;

const getErrorMessage = (code: string) => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes];
  }
  return "Error al registrar. Intenta nuevamente.";
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [referralValidation, setReferralValidation] = useState<{
    valid: boolean;
    referrerName: string | null;
    checked: boolean;
  }>({ valid: false, referrerName: null, checked: false });

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      router.push("/menu");
    }
  }, [session, sessionLoading, router]);

  // Auto-fill referral code from URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralValidation({ valid: false, referrerName: null, checked: false });
      return;
    }

    try {
      const response = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setReferralValidation({
          valid: data.valid,
          referrerName: data.referrerName,
          checked: true,
        });
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      setReferralValidation({ valid: false, referrerName: null, checked: true });
    }
  };

  // Handle referral code change
  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setFormData({ ...formData, referralCode: code });
    
    // Debounce validation
    if (code.trim().length >= 6) {
      validateReferralCode(code);
    } else {
      setReferralValidation({ valid: false, referrerName: null, checked: false });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Por favor ingresa tu email");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error, data } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        toast.error(getErrorMessage(error.code));
        setIsLoading(false);
        return;
      }

      // If registration successful and there's a valid referral code, complete the referral
      if (data?.user && formData.referralCode.trim() && referralValidation.valid) {
        try {
          await fetch("/api/referrals/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referralCode: formData.referralCode.trim(),
              newUserId: data.user.id,
            }),
          });
          toast.success("¡Cuenta creada y referido completado! 🎉");
        } catch (refError) {
          console.error("Error completing referral:", refError);
          // Don't show error to user, registration was successful
        }
      } else {
        toast.success("¡Cuenta creada exitosamente!");
      }

      router.push("/login?registered=true");
    } catch (err) {
      toast.error("Error al crear la cuenta. Intenta nuevamente.");
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

        {/* Register Card - Optimizado Mobile First */}
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
            ¡Únete a Porkyrios!
          </h1>
          <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Crea tu cuenta para hacer tus pedidos
          </p>

          {/* Social Login Buttons */}
          <SocialLoginButtons redirectUrl="/menu" mode="register" />

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Name */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="name" className="text-sm md:text-base">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

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
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="off"
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="off"
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            {/* Referral Code - Optional */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="referralCode" className="text-sm md:text-base">
                Código de Referido <span className="text-gray-400 text-xs">(Opcional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="REF-XXXXXX"
                  value={formData.referralCode}
                  onChange={handleReferralCodeChange}
                  disabled={isLoading}
                  className={`h-10 md:h-12 text-sm md:text-base ${
                    referralValidation.checked
                      ? referralValidation.valid
                        ? "border-green-500"
                        : "border-red-500"
                      : ""
                  }`}
                />
                {referralValidation.checked && referralValidation.valid && (
                  <CheckCircle2 className="absolute right-3 top-2 md:top-3 w-5 h-5 md:w-6 md:h-6 text-green-500" />
                )}
              </div>
              {referralValidation.checked && (
                <p
                  className={`text-[10px] md:text-xs ${
                    referralValidation.valid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {referralValidation.valid
                    ? `✓ Código válido de ${referralValidation.referrerName}. ¡Recibirás 10% de descuento!`
                    : "✗ Código de referido no válido"}
                </p>
              )}
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
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-5 md:mt-6 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-[#FF6B35] font-bold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}