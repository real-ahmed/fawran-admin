const parseBooleanEnv = (value: string | undefined) => {
  return ['1', 'true', 'yes', 'on'].includes((value || '').toLowerCase());
};

export const recaptchaConfig = {
  enabled: parseBooleanEnv(import.meta.env.VITE_RECAPTCHA_ENABLED),
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  action: import.meta.env.VITE_RECAPTCHA_ACTION || 'admin_login',
};
