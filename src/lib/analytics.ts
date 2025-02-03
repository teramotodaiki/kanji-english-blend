declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params: {
        event_category: string;
        event_label?: string;
        value?: number;
      }
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

export const trackShare = (platform: string) => {
  trackEvent('share', 'social', platform);
};
