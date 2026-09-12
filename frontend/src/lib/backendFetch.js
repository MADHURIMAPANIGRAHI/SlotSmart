const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include', // cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || 'API Error');
  }
  if (!res.headers.get("content-type")?.includes("application/json")) {
  throw new Error("Invalid server response");
}

  return data;
}