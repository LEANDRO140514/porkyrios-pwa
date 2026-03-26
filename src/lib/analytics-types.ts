// TypeScript types for Google Analytics gtag
declare global {
  interface Window {
    gtag: {
      (command: 'config', id: string, config?: Record<string, any>): void;
      (command: 'event', action: string, params?: Record<string, any>): void;
      (
        command: 'consent',
        action: 'default' | 'update',
        params: Record<string, string>
      ): void;
    };
    dataLayer?: any[];
  }
}

// TypeScript types for Meta Pixel fbq
declare global {
  interface Window {
    fbq: {
      (command: 'init', pixelId: string): void;
      (command: 'track', event: string, data?: Record<string, any>): void;
      (command: 'trackCustom', event: string, data?: Record<string, any>): void;
    };
  }
}

export type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  event_callback?: () => void;
  [key: string]: any;
};

export type FbqStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'FindLocation'
  | 'Subscribe';

export {};
