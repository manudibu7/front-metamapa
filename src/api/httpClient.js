const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const httpClient = {
  async get(url, options = {}) {
    const res = await fetch(url, { headers: defaultHeaders, ...options });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  },
};
