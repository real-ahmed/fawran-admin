import { useCallback, useEffect, useMemo, useState } from 'react';

import { recaptchaConfig } from '@/config/recaptcha';

type RecaptchaStatus = 'disabled' | 'loading' | 'ready' | 'error';

type RecaptchaClient = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaClient;
  }
}

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3';

let recaptchaLoadPromise: Promise<void> | null = null;

const waitForRecaptchaReady = () => {
  return new Promise<void>((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('Google reCAPTCHA is not available.'));
      return;
    }

    window.grecaptcha.ready(resolve);
  });
};

const getRecaptchaScriptUrl = (siteKey: string) => {
  const url = new URL('https://www.google.com/recaptcha/api.js');
  url.searchParams.set('render', siteKey);
  return url.toString();
};

const loadRecaptchaScript = (siteKey: string) => {
  if (window.grecaptcha) {
    return waitForRecaptchaReady();
  }

  if (recaptchaLoadPromise) {
    return recaptchaLoadPromise;
  }

  recaptchaLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        waitForRecaptchaReady().then(resolve).catch(reject);
      }, { once: true });
      existingScript.addEventListener('error', () => {
        recaptchaLoadPromise = null;
        reject(new Error('Failed to load Google reCAPTCHA.'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = getRecaptchaScriptUrl(siteKey);
    script.async = true;
    script.defer = true;
    script.onload = () => {
      waitForRecaptchaReady().then(resolve).catch((error: unknown) => {
        recaptchaLoadPromise = null;
        reject(error);
      });
    };
    script.onerror = () => {
      recaptchaLoadPromise = null;
      reject(new Error('Failed to load Google reCAPTCHA.'));
    };

    document.head.appendChild(script);
  });

  return recaptchaLoadPromise;
};

export const useRecaptcha = () => {
  const { action, enabled, siteKey } = recaptchaConfig;
  const [status, setStatus] = useState<RecaptchaStatus>(enabled ? 'loading' : 'disabled');

  useEffect(() => {
    let mounted = true;

    if (!enabled) {
      setStatus('disabled');
      return;
    }

    if (!siteKey) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    loadRecaptchaScript(siteKey)
      .then(() => {
        if (mounted) setStatus('ready');
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [enabled, siteKey]);

  const executeRecaptcha = useCallback(async () => {
    if (!enabled) return null;

    if (!siteKey) {
      throw new Error('Google reCAPTCHA site key is not configured.');
    }

    await loadRecaptchaScript(siteKey);

    if (!window.grecaptcha) {
      throw new Error('Google reCAPTCHA is not available.');
    }

    const token = await window.grecaptcha.execute(siteKey, { action });

    if (!token) {
      throw new Error('Google reCAPTCHA did not return a token.');
    }

    return token;
  }, [action, enabled, siteKey]);

  return useMemo(() => ({
    enabled,
    hasError: status === 'error',
    isLoading: status === 'loading',
    isReady: status === 'ready',
    executeRecaptcha,
  }), [enabled, executeRecaptcha, status]);
};
