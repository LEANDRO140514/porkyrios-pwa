import type { GtagEvent, FbqStandardEvent } from './analytics-types';

// Google Analytics 4 Event Tracking
export const trackGAEvent = (event: GtagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event,
    });
  }
};

// Google Analytics 4 Page View (auto-tracked, but available manually)
export const trackGAPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    });
  }
};

// Meta Pixel Standard Event Tracking
export const trackFbqEvent = (
  event: FbqStandardEvent,
  data?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }
};

// Meta Pixel Custom Event Tracking
export const trackFbqCustomEvent = (
  eventName: string,
  data?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data);
  }
};

// GDPR Consent Update for Google Analytics
export const updateAnalyticsConsent = (consentState: {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', consentState);
  }
};
