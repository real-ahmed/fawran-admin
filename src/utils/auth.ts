export const extractAccessToken = (responseData: unknown): string | null => {
  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  const root = responseData as Record<string, unknown>;
  const data = root.data;

  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;

    if (typeof payload.access_token === 'string') {
      return payload.access_token;
    }

    if (typeof payload.token === 'string') {
      return payload.token;
    }
  }

  if (typeof root.access_token === 'string') {
    return root.access_token;
  }

  if (typeof root.token === 'string') {
    return root.token;
  }

  return null;
};
