export interface PaymentPreferenceData {
  orderId: string;
  email: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    description?: string;
    picture_url?: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: string;
    };
  };
  notificationUrl?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  client_id: string;
  date_created: string;
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
}

export interface WebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  id: string;
  live_mode: boolean;
  resource: string;
  timestamp: string;
  type: 'payment' | 'plan' | 'subscription' | 'invoice';
  user_id: string;
}
