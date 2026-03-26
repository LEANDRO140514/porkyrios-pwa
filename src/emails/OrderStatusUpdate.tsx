import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
} from '@react-email/components';

interface OrderStatusUpdateProps {
  orderNumber: string;
  customerName: string;
  status: string;
  statusMessage: string;
  estimatedTime?: string;
}

// Configuración de estados con emojis y colores
const statusConfig: Record<
  string,
  { label: string; emoji: string; color: string; message: string }
> = {
  pending_payment: {
    label: 'Pendiente de Pago',
    emoji: '⏳',
    color: '#FFA500',
    message: 'Estamos esperando la confirmación de tu pago.',
  },
  confirmed: {
    label: 'Confirmado',
    emoji: '✅',
    color: '#4CAF50',
    message: '¡Tu pedido ha sido confirmado y está siendo preparado!',
  },
  preparing: {
    label: 'En Preparación',
    emoji: '👨‍🍳',
    color: '#2196F3',
    message: 'Nuestro equipo está preparando tu delicioso pedido.',
  },
  ready: {
    label: 'Listo para Entregar',
    emoji: '📦',
    color: '#FF9800',
    message: 'Tu pedido está listo y será entregado pronto.',
  },
  out_for_delivery: {
    label: 'En Camino',
    emoji: '🚴',
    color: '#FF6B35',
    message: 'Tu pedido está en camino. ¡Pronto lo disfrutarás!',
  },
  delivered: {
    label: 'Entregado',
    emoji: '🎉',
    color: '#4CAF50',
    message: '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes.',
  },
  cancelled: {
    label: 'Cancelado',
    emoji: '❌',
    color: '#F44336',
    message: 'Tu pedido ha sido cancelado.',
  },
};

export default function OrderStatusUpdate({
  orderNumber = 'PK-12345',
  customerName = 'Cliente',
  status = 'preparing',
  statusMessage = '',
  estimatedTime,
}: OrderStatusUpdateProps) {
  const config = statusConfig[status] || statusConfig.confirmed;
  const displayMessage = statusMessage || config.message;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png"
              alt="Porkyrios"
              width="100"
              height="100"
              style={logo}
            />
          </Section>

          {/* Status Badge */}
          <Section style={statusBadgeSection}>
            <div style={{ ...statusBadge, backgroundColor: config.color }}>
              <Text style={statusEmoji}>{config.emoji}</Text>
              <Text style={statusLabel}>{config.label}</Text>
            </div>
          </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Actualización de tu Pedido</Heading>
            <Text style={subtitle}>Hola {customerName}</Text>
          </Section>

          {/* Order Number */}
          <Section style={orderNumberSection}>
            <Text style={orderNumberLabel}>Pedido</Text>
            <Text style={orderNumberValue}>{orderNumber}</Text>
          </Section>

          <Hr style={divider} />

          {/* Status Message */}
          <Section style={messageSection}>
            <Text style={messageText}>{displayMessage}</Text>
            {estimatedTime && (
              <Text style={estimatedTimeText}>
                <strong>Tiempo estimado:</strong> {estimatedTime}
              </Text>
            )}
          </Section>

          {/* Timeline (opcional para ciertos estados) */}
          {status !== 'cancelled' && status !== 'delivered' && (
            <>
              <Hr style={divider} />
              <Section style={timelineSection}>
                <Heading as="h3" style={timelineTitle}>
                  Estado de tu Pedido
                </Heading>
                <div style={timelineContainer}>
                  <TimelineItem
                    label="Confirmado"
                    active={
                      status === 'confirmed' ||
                      status === 'preparing' ||
                      status === 'ready' ||
                      status === 'out_for_delivery' ||
                      status === 'delivered'
                    }
                    completed={
                      status === 'preparing' ||
                      status === 'ready' ||
                      status === 'out_for_delivery' ||
                      status === 'delivered'
                    }
                  />
                  <TimelineItem
                    label="Preparando"
                    active={
                      status === 'preparing' ||
                      status === 'ready' ||
                      status === 'out_for_delivery' ||
                      status === 'delivered'
                    }
                    completed={
                      status === 'ready' || status === 'out_for_delivery' || status === 'delivered'
                    }
                  />
                  <TimelineItem
                    label="En Camino"
                    active={status === 'out_for_delivery' || status === 'delivered'}
                    completed={status === 'delivered'}
                  />
                  <TimelineItem label="Entregado" active={status === 'delivered'} completed={false} />
                </div>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Gracias por tu preferencia. Cualquier duda, estamos para servirte.
            </Text>
            <Text style={footerTextSmall}>
              © 2025 Porkyrios. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Componente de Timeline
function TimelineItem({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div style={timelineItem}>
      <div
        style={{
          ...timelineCircle,
          backgroundColor: active ? '#FF6B35' : completed ? '#4CAF50' : '#E0E0E0',
        }}
      >
        {completed && <Text style={checkmark}>✓</Text>}
      </div>
      <Text
        style={{
          ...timelineLabel,
          color: active || completed ? '#333333' : '#999999',
          fontWeight: active ? 'bold' : 'normal',
        }}
      >
        {label}
      </Text>
    </div>
  );
}

// Estilos
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const logo = {
  margin: '0 auto',
  borderRadius: '50%',
};

const statusBadgeSection = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const statusBadge = {
  display: 'inline-block',
  padding: '15px 30px',
  borderRadius: '50px',
  textAlign: 'center' as const,
};

const statusEmoji = {
  fontSize: '32px',
  margin: '0 0 5px 0',
};

const statusLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 10px 0',
};

const subtitle = {
  fontSize: '16px',
  color: '#666666',
  margin: '0',
};

const orderNumberSection = {
  backgroundColor: '#FFF5F0',
  borderRadius: '8px',
  padding: '15px',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const orderNumberLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 5px 0',
};

const orderNumberValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#FF6B35',
  margin: '0',
};

const divider = {
  borderColor: '#eeeeee',
  margin: '20px 0',
};

const messageSection = {
  textAlign: 'center' as const,
  padding: '20px',
};

const messageText = {
  fontSize: '16px',
  color: '#333333',
  lineHeight: '24px',
  margin: '0 0 10px 0',
};

const estimatedTimeText = {
  fontSize: '14px',
  color: '#666666',
  margin: '10px 0 0 0',
};

const timelineSection = {
  padding: '20px 0',
};

const timelineTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const timelineContainer = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  padding: '10px',
};

const timelineItem = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  flex: 1,
};

const timelineCircle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
};

const checkmark = {
  fontSize: '20px',
  color: '#ffffff',
  fontWeight: 'bold',
  margin: '0',
};

const timelineLabel = {
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 10px 0',
};

const footerTextSmall = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
};
