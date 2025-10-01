import { API_BASE_URL } from '../config';

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  is_active: boolean;
  preferences?: string;
  measurements?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  user_type?: string;
  preferences?: string;
  measurements?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const tokenData = await response.json();
    this.token = tokenData.access_token;
    localStorage.setItem('token', this.token as string);

    // Get user info
    const user = await this.getCurrentUser();

    return { user, token: this.token as string };
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || 'Registration failed');
    }

    const user: User = await response.json();
    return user;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const user = await response.json();
    console.log('User data from backend:', user);
    return user;
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Helper method to make authenticated API requests
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const headers: HeadersInit = {
      ...(options.headers as Record<string, string> || {}),
      'Authorization': `Bearer ${this.token}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export const authService = new AuthService();