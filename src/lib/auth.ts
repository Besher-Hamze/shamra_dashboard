import Cookies from 'js-cookie';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';
    isActive: boolean;
    profileImage?: string;
    branchId?: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        access_token: string;
        refresh_token: string;
        user: User;
    };
    message: string;
}

export class AuthService {
    private static readonly ACCESS_TOKEN_KEY = 'access_token';
    private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private static readonly USER_KEY = 'user';

    static setTokens(accessToken: string, refreshToken: string): void {
        Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, { expires: 7, secure: true });
        Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, { expires: 30, secure: true });
    }

    static getAccessToken(): string | undefined {
        return Cookies.get(this.ACCESS_TOKEN_KEY);
    }

    static getRefreshToken(): string | undefined {
        return Cookies.get(this.REFRESH_TOKEN_KEY);
    }

    static setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static getUser(): User | null {
        if (typeof window === 'undefined') return null;

        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    static isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    static logout(): void {
        Cookies.remove(this.ACCESS_TOKEN_KEY);
        Cookies.remove(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }
}
