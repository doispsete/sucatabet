export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public path?: string,
    public timestamp?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';


function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(path: string, options: RequestInit & { retries?: number; _retryCount?: number } = {}): Promise<T> {
  const { retries = 2, _retryCount = 0, ...fetchOptions } = options;
  const url = `${API_URL}${path}`;

  const token = getTokenFromCookie();
  
  const defaultOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
      const isLoginPath = typeof window !== 'undefined' && window.location.pathname === '/login';
      const isLogoutPath = path === '/auth/logout';

      if (typeof window !== 'undefined' && !isLoginPath && !isLogoutPath) {
        // Attempt to clear cookie via server before redirecting
        fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).finally(() => {
          window.location.href = '/login';
        });
      }
      throw new ApiError(401, 'Não autenticado', path, new Date().toISOString());
    }

    if (response.status === 403) {
      throw new ApiError(403, 'Acesso negado', path, new Date().toISOString());
    }

    if (response.status === 429) {
      throw new ApiError(429, 'Muitas tentativas. Aguarde um momento.', path, new Date().toISOString());
    }

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Erro ${response.status}` };
      }

      const parseMessage = (m: any): string => {
        if (!m) return `Erro na requisição (${response.status})`;
        if (typeof m === 'string') return m;
        if (Array.isArray(m)) return parseMessage(m[0]);
        if (typeof m === 'object') {
          // Tratar especificamente o erro de validação que causou o crash {field, errors}
          if (m.field && m.errors) {
            const fieldLabel = m.field.toUpperCase();
            const errorMsg = Array.isArray(m.errors) ? m.errors[0] : String(m.errors);
            return `${fieldLabel}: ${errorMsg}`;
          }
          if (m.message) return parseMessage(m.message);
          return JSON.stringify(m);
        }
        return String(m);
      };

      const apiMessage = parseMessage(errorData.message || errorData);

      throw new ApiError(
        response.status,
        apiMessage,
        errorData.path || path,
        errorData.timestamp || new Date().toISOString()
      );
    }

    if (response.status === 204) return {} as T;
    return response.json();

  } catch (error) {
    // Retry on network failures (TypeError)
    if (error instanceof TypeError && _retryCount < retries) {
      const backoff = 500 * (_retryCount + 1);
      await new Promise(r => setTimeout(r, backoff));
      return request<T>(path, { ...options, _retryCount: _retryCount + 1 });
    }

    // If already an ApiError, rethrow
    if (error instanceof ApiError) throw error;

    // Network error after retries
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        `Sem conexão com o servidor (${url}). Verifique se o backend está rodando.`,
        path,
        new Date().toISOString()
      );
    }

    // Generic error
    throw new ApiError(0, String(error), path, new Date().toISOString());
  }
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) => 
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) => 
    request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),
};
