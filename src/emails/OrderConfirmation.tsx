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
  Row,
  Column,
} from '@react-email/components';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  iva: number;
  total: number;
  deliveryMethod: string;
  estimatedDelivery: string;
}

export default function OrderConfirmation({
  orderNumber = 'PK-12345',
  customerName = 'Cliente',
  items = [
    { name: 'Taco al Pastor', quantity: 2, price: 25.0 },
    { name: 'Torta de Jamón', quantity: 1, price: 45.0 },
  ],
  subtotal = 95.0,
  deliveryCost = 30.0,
  iva = 15.2,
  total = 140.2,
  deliveryMethod = 'delivery',
  estimatedDelivery = '45 minutos',
}: OrderConfirmationProps) {
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

          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>¡Pedido Confirmado! 🎉</Heading>
            <Text style={subtitle}>
              Hola {customerName}, tu pedido ha sido recibido exitosamente
            </Text>
          </Section>

          {/* Order Number */}
          <Section style={orderNumberSection}>
            <Text style={orderNumberLabel}>Número de Pedido</Text>
            <Text style={orderNumberValue}>{orderNumber}</Text>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section>
            <Heading as="h2" style={sectionTitle}>
              Resumen de tu Pedido
            </Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemName}>
                  <Text style={itemText}>
                    {item.name} x{item.quantity}
                  </Text>
                </Column>
                <Column style={itemPrice}>
                  <Text style={itemText}>${(item.price * item.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <Section>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
              </Column>
            </Row>

            {deliveryCost > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Envío</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>${deliveryCost.toFixed(2)}</Text>
                </Column>
              </Row>
            )}

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>IVA (16%)</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${iva.toFixed(2)}</Text>
              </Column>
            </Row>

            <Row style={totalRowFinal}>
              <Column>
                <Text style={totalLabelFinal}>Total</Text>
              </Column>
              <Column>
                <Text style={totalValueFinal}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Delivery Info */}
          <Section style={deliverySection}>
            <Heading as="h3" style={deliveryTitle}>
              {deliveryMethod === 'delivery' ? '🚴 Información de Entrega' : '🏪 Recoger en Tienda'}
            </Heading>
            <Text style={deliveryText}>
              <strong>Tiempo estimado:</strong> {estimatedDelivery}
            </Text>
            {deliveryMethod === 'delivery' ? (
              <Text style={deliveryText}>
                Tu pedido será entregado en la dirección registrada.
              </Text>
            ) : (
              <Text style={deliveryText}>
                Podrás recoger tu pedido en nuestra sucursal.
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Gracias por tu preferencia. Puedes rastrear tu pedido en cualquier momento.
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

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#FF6B35',
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
  padding: '20px',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const orderNumberLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 5px 0',
};

const orderNumberValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#FF6B35',
  margin: '0',
};

const divider = {
  borderColor: '#eeeeee',
  margin: '20px 0',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0',
};

const itemRow = {
  padding: '10px 0',
  borderBottom: '1px solid #eeeeee',
};

const itemName = {
  width: '70%',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemText = {
  fontSize: '14px',
  color: '#333333',
  margin: '0',
};

const totalRow = {
  padding: '5px 0',
};

const totalRowFinal = {
  padding: '10px 0',
  borderTop: '2px solid #FF6B35',
  marginTop: '10px',
};

const totalLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const totalValue = {
  fontSize: '14px',
  color: '#333333',
  textAlign: 'right' as const,
  margin: '0',
};

const totalLabelFinal = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0',
};

const totalValueFinal = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#FF6B35',
  textAlign: 'right' as const,
  margin: '0',
};

const deliverySection = {
  backgroundColor: '#F0F9FF',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const deliveryTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 10px 0',
};

const deliveryText = {
  fontSize: '14px',
  color: '#666666',
  margin: '5px 0',
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
