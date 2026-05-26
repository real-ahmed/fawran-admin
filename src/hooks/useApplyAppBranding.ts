import { useEffect } from 'react';

export const useApplyAppBranding = (appName: string, faviconUrl?: string) => {
  useEffect(() => {
    document.title = appName;

    if (!faviconUrl) return;

    const existingFavicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    const favicon = existingFavicon || document.createElement('link');

    favicon.rel = 'icon';
    favicon.href = faviconUrl;

    if (!existingFavicon) {
      document.head.appendChild(favicon);
    }
  }, [appName, faviconUrl]);
};
