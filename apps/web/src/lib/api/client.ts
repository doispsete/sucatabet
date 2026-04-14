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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';


function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

async function request<T>(path: string, options: RequestInit & { retries?: number; _retryCount?: number } = {}): Promise<T> {
  const { retries = 2, _retryCount = 0, ...fetchOptions } = options;
  const url = `${API_URL}${path}`;
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers as Record<string, string>,
  };

  const isAuthLogin = path === '/auth/login';

  if (token && !isAuthLogin) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const defaultOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isLoginPath = pathname === '/login' || pathname === '/login/';
      const isRegisterPath = pathname === '/cadastro' || pathname === '/cadastro/';
      const isLogoutPath = path === '/auth/logout';
      const isMePath = path === '/auth/me';
      
      if (typeof window !== 'undefined' && !isLoginPath && !isRegisterPath && !isLogoutPath && !isMePath) {
        document.cookie = 'access_token=; path=/; max-age=0';
        window.location.href = '/login';
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
