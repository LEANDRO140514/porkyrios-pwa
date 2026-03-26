"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Gift, Users, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { ShareButtons } from "@/components/ShareButtons";
import { useRouter } from "next/navigation";

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
}

interface ReferralData {
  referralCode: string;
  stats: ReferralStats;
}

interface Referral {
  id: number;
  referralCode: string;
  status: string;
  referredUserName: string | null;
  referredUserEmail: string | null;
  createdAt: string;
  completedAt: string | null;
  rewardCouponId: number | null;
}

export function ReferralDialog({ open, onOpenChange }: ReferralDialogProps) {
  const router = useRouter();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      loadReferralData();
    }
  }, [open]);

  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Load referral code and stats
      const codeResponse = await fetch("/api/referrals/my-code", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (codeResponse.ok) {
        const data = await codeResponse.json();
        setReferralData(data);
      } else {
        toast.error("Error al cargar tu código de referido");
      }

      // Load referral list
      const listResponse = await fetch("/api/referrals/my-referrals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (listResponse.ok) {
        const data = await listResponse.json();
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Error al cargar información de referidos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralData?.referralCode) return;

    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      toast.success("¡Código copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el código");
    }
  };

  const getReferralUrl = () => {
    if (typeof window === "undefined" || !referralData?.referralCode) return "";
    return `${window.location.origin}/register?ref=${referralData.referralCode}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Completado", className: "bg-blue-100 text-blue-800" },
      rewarded: { label: "Recompensado", className: "bg-green-100 text-green-800" },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FF6B35] flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Invita un Amigo
          </DialogTitle>
          <DialogDescription>
            Comparte tu código y ambos reciben descuentos especiales
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
          </div>
        ) : (
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </TabsTrigger>
              <TabsTrigger value="referrals">
                <Users className="w-4 h-4 mr-2" />
                Mis Referidos
              </TabsTrigger>
            </TabsList>

            {/* Share Tab */}
            <TabsContent value="share" className="space-y-6">
              {/* Stats Cards */}
              {referralData && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {referralData.stats.total_referrals}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Total Referidos</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {referralData.stats.pending_referrals}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Pendientes</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {referralData.stats.completed_referrals}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Completados</div>
                  </div>
                </div>
              )}

              {/* Rewards Info */}
              <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8E53]/10 rounded-lg p-4 border-2 border-[#FF6B35]/20">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#FF6B35]" />
                  ¿Cómo funciona?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold">1.</span>
                    <span>Comparte tu código con amigos y familiares</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold">2.</span>
                    <span>Tu amigo se registra usando tu código</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold">3.</span>
                    <span>
                      <strong>Tú recibes 10% de descuento</strong> y{" "}
                      <strong>tu amigo recibe 10% de bienvenida</strong>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Referral Code */}
              {referralData && (
                <div className="space-y-3">
                  <Label htmlFor="referral-code" className="text-base font-semibold">
                    Tu Código de Referido
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="referral-code"
                      value={referralData.referralCode}
                      readOnly
                      className="font-mono text-lg font-bold text-[#FF6B35] bg-gray-50"
                    />
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      className="min-w-[100px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Share on Social Media */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Compartir en Redes Sociales</Label>
                <ShareButtons
                  url={getReferralUrl()}
                  title="¡Únete a Porkyrios con mi código de referido!"
                  description={`Usa mi código ${referralData?.referralCode} al registrarte y obtén 10% de descuento en tu primera orden. ¡El verdadero lujo está en el sabor! 🍽️`}
                  hashtags={["Porkyrios", "Referidos", "Descuento"]}
                />
              </div>

              {/* Terms & Policies Link */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/politicas-referidos");
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF6B35] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="underline">Ver Políticas del Programa de Referidos</span>
                </button>
              </div>
            </TabsContent>

            {/* Referrals List Tab */}
            <TabsContent value="referrals" className="space-y-4">
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aún no tienes referidos.</p>
                  <p className="text-sm">¡Comparte tu código para empezar!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {referral.referredUserName || "Usuario Pendiente"}
                          </div>
                          {referral.referredUserEmail && (
                            <div className="text-sm text-gray-600">
                              {referral.referredUserEmail}
                            </div>
                          )}
                        </div>
                        {getStatusBadge(referral.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(referral.createdAt).toLocaleDateString("es-MX")}
                        {referral.completedAt && (
                          <> • Completado: {new Date(referral.completedAt).toLocaleDateString("es-MX")}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Terms & Policies Link in referrals tab */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/politicas-referidos");
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF6B35] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="underline">Ver Políticas del Programa de Referidos</span>
                </button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}