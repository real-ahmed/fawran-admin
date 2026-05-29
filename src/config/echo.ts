import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

window.Pusher = Pusher;

const getAuthToken = () => {
    try {
        const storage = localStorage.getItem('fawran-auth-storage');
        if (storage) {
            const parsed = JSON.parse(storage);
            return parsed?.state?.token || '';
        }
    } catch (e) {
        // ignore error
    }
    return '';
};

const buildAuthHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
});

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
        headers: buildAuthHeaders(getAuthToken()),
    },
});

export const setEchoAuthToken = (token: string | null) => {
    const connector = echo.connector as {
        options?: {
            auth?: {
                headers?: Record<string, string>;
            };
        };
    };

    if (connector.options?.auth) {
        connector.options.auth.headers = buildAuthHeaders(token || '');
    }
};

export default echo;
