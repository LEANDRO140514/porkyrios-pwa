"use client";

import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Share2, Copy, Check, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  variant?: "default" | "compact";
}

export function ShareButtons({
  url,
  title = "Porkyrios - El Verdadero Lujo Está en el Sabor",
  description = "¡Descubre los mejores platillos con entrega rápida! 🍽️",
  hashtags = ["Porkyrios", "ComidaDeliciosa", "EntregaRápida"],
  className = "",
  variant = "default",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  // Use current URL if not provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.join(",");

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
    toast.success("Compartiendo en Facebook...");
  };

  const handleInstagramShare = async () => {
    // Instagram no tiene API web directa para compartir
    // En móvil: Usar native share que detecta Instagram
    // En escritorio: Copiar link y dar instrucciones
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        toast.success("¡Selecciona Instagram para compartir!");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      // En escritorio: copiar link y dar instrucciones
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado! Pégalo en tu historia o post de Instagram", {
        duration: 4000,
      });
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappText = `${title}\n\n${description}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Compartiendo en WhatsApp...");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("¡Link copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar el link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        toast.success("¡Compartido exitosamente!");
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Error al compartir");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          onClick={handleNativeShare}
          size="sm"
          variant="outline"
          className="bg-white/10 text-white border-white hover:bg-white/20 backdrop-blur"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Primera fila: 3 botones arriba */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleFacebookShare}
          size="sm"
          className="bg-[#1877F2] hover:bg-[#1864D9] text-white"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>

        <Button
          onClick={handleInstagramShare}
          size="sm"
          className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white"
        >
          <Instagram className="w-4 h-4 mr-2" />
          Instagram
        </Button>

        <Button
          onClick={handleWhatsAppShare}
          size="sm"
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      {/* Segunda fila: 2 botones centrados abajo */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </>
          )}
        </Button>

        {/* Native Share API for mobile */}
        {typeof window !== "undefined" && navigator.share && (
          <Button
            onClick={handleNativeShare}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Más opciones
          </Button>
        )}
      </div>
    </div>
  );
}