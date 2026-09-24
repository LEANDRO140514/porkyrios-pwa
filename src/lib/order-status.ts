// Order statuses as customers see them on /tracking. The admin panel moves
// orders through STATUS_FLOW; older statuses are kept so old orders still render.

export type StatusIcon = 'payment' | 'confirmed' | 'chef' | 'flame' | 'package' | 'ready' | 'truck' | 'done' | 'cancelled' | 'unknown';

export type StatusMeta = {
  label: string;
  description: string;
  progress: number;
  icon: StatusIcon;
  color: string;
  bgColor: string;
};

/** The steps an order goes through, in order (admin panel workflow). */
export const STATUS_FLOW = ['pending_payment', 'preparing', 'cooking', 'packing', 'ready', 'completed'] as const;

const META: Record<string, StatusMeta> = {
  pending_payment: { label: 'Pendiente de Pago', description: 'Esperando confirmación del pago', progress: 10, icon: 'payment', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  preparing: { label: 'En Preparación', description: 'Estamos preparando tu pedido con cuidado', progress: 30, icon: 'chef', color: 'text-orange-600', bgColor: 'bg-[#FF6B35]' },
  cooking: { label: 'Cocinando', description: 'Tu pedido está en la parrilla', progress: 50, icon: 'flame', color: 'text-orange-600', bgColor: 'bg-orange-500' },
  packing: { label: 'Empacando', description: 'Estamos empacando tu pedido', progress: 70, icon: 'package', color: 'text-amber-600', bgColor: 'bg-amber-500' },
  ready: { label: 'Listo', description: 'Tu pedido está listo para ser entregado', progress: 85, icon: 'ready', color: 'text-green-600', bgColor: 'bg-green-500' },
  completed: { label: 'Completado', description: 'Tu pedido fue entregado. ¡Buen provecho!', progress: 100, icon: 'done', color: 'text-green-600', bgColor: 'bg-green-500' },
  cancelled: { label: 'Cancelado', description: 'Este pedido ha sido cancelado', progress: 0, icon: 'cancelled', color: 'text-red-600', bgColor: 'bg-red-500' },
  // Legacy statuses, no longer set by the app
  confirmed: { label: 'Confirmado', description: 'Tu pedido ha sido confirmado', progress: 20, icon: 'confirmed', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  out_for_delivery: { label: 'En Camino', description: 'Tu pedido está en camino', progress: 90, icon: 'truck', color: 'text-purple-600', bgColor: 'bg-purple-500' },
  delivered: { label: 'Entregado', description: 'Tu pedido ha sido entregado exitosamente', progress: 100, icon: 'done', color: 'text-green-600', bgColor: 'bg-green-500' },
};

const UNKNOWN: StatusMeta = {
  label: 'Actualizando estado',
  description: 'Tu pedido está siendo procesado',
  progress: 0,
  icon: 'unknown',
  color: 'text-gray-600',
  bgColor: 'bg-gray-400',
};

/** Display data for any status; unknown statuses get a neutral fallback instead of crashing. */
export function getStatusMeta(status: string | null | undefined): StatusMeta {
  return (status && Object.prototype.hasOwnProperty.call(META, status) ? META[status] : undefined) ?? UNKNOWN;
}

export function isKnownStatus(status: string | null | undefined): boolean {
  return !!status && Object.prototype.hasOwnProperty.call(META, status);
}

/** No more changes expected: stop polling and animations. */
export function isFinalStatus(status: string | null | undefined): boolean {
  return status === 'completed' || status === 'delivered' || status === 'cancelled';
}

export function estimatedTimeText(status: string | null | undefined, createdAt: string, now = new Date()): string {
  const minutesElapsed = Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60000);
  const remaining = (total: number, soon: string) => {
    const left = Math.max(0, total - minutesElapsed);
    return left > 0 ? `${left} minutos aproximadamente` : soon;
  };

  switch (status) {
    case 'pending_payment':
      return 'Esperando confirmación de pago';
    case 'confirmed':
      return 'Iniciando preparación...';
    case 'preparing':
      return remaining(25, 'Casi listo para cocinar');
    case 'cooking':
      return remaining(20, 'Casi listo');
    case 'packing':
      return remaining(10, 'Listo en unos minutos');
    case 'ready':
      return '¡Tu pedido está listo!';
    case 'out_for_delivery':
      return remaining(30, 'Llegando pronto');
    case 'completed':
    case 'delivered':
      return 'Pedido entregado exitosamente';
    case 'cancelled':
      return 'Pedido cancelado';
    default:
      return 'Calculando tiempo...';
  }
}
