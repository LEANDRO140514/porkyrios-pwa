"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ReviewDialog = ({ open, onOpenChange, onSuccess }: ReviewDialogProps) => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // Load existing review when dialog opens
  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("bearer_token");
    if (!token) return;

    fetch("/api/reviews/my-review", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.review) {
          setRating(data.review.rating);
          setComment(data.review.comment);
          setIsEditing(true);
          setExistingStatus(data.review.status);
        } else {
          setRating(0);
          setComment("");
          setIsEditing(false);
          setExistingStatus(null);
        }
      })
      .catch(() => {});
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres");
      return;
    }

    if (comment.trim().length > 500) {
      toast.error("El comentario no puede exceder 500 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");

      if (!token) {
        toast.error("Debes iniciar sesión para dejar una reseña");
        router.push("/login?redirect=/");
        return;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "PROFANITY_DETECTED") {
          toast.error("Tu comentario contiene palabras inapropiadas");
        } else if (data.code === "RATE_LIMIT_EXCEEDED") {
          toast.error("Espera 5 minutos antes de enviar otra reseña");
        } else if (data.code === "UNAUTHORIZED") {
          toast.error("Debes iniciar sesión para dejar una reseña");
          router.push("/login?redirect=/");
        } else {
          toast.error(data.error || "Error al enviar la reseña");
        }
        return;
      }

      toast.success(
        data.updated ? "¡Reseña actualizada! Será revisada antes de publicarse" : "¡Reseña enviada! Será revisada antes de publicarse",
        { description: "Gracias por compartir tu experiencia" }
      );

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error al enviar la reseña. Intenta de nuevo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "en revisión",
    approved: "publicada ✅",
    rejected: "rechazada ❌",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "✏️ Editar tu Reseña" : "⭐ Comparte tu Experiencia"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Tu reseña actual está ${existingStatus ? statusLabel[existingStatus] ?? existingStatus : "guardada"}. Puedes modificarla.`
              : "Tu opinión nos ayuda a mejorar y a otros clientes a elegir"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500">
                {rating === 1 && "⭐ Muy malo"}
                {rating === 2 && "⭐⭐ Malo"}
                {rating === 3 && "⭐⭐⭐ Regular"}
                {rating === 4 && "⭐⭐⭐⭐ Bueno"}
                {rating === 5 && "⭐⭐⭐⭐⭐ Excelente"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tu comentario <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Cuéntanos tu experiencia con el servicio, la comida, la entrega..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={500}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 caracteres (mínimo 10)
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>📋 Nota:</strong>{" "}
              {isEditing
                ? "Al guardar, tu reseña volverá a revisión antes de publicarse."
                : "Tu reseña será revisada por nuestro equipo antes de publicarse."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            {isSubmitting
              ? "Guardando..."
              : isEditing
              ? "Actualizar Reseña"
              : "Enviar Reseña"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
