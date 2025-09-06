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

    // Check if we're in production and using HTTPS
    private static isProduction(): boolean {
        return process.env.NODE_ENV === 'production';
    }

    private static isHTTPS(): boolean {
        if (typeof window === 'undefined') return false;
        return window.location.protocol === 'https:';
    }

    static setTokens(accessToken: string, refreshToken: string): void {
        const cookieOptions = {
            expires: 7,
            secure: this.isHTTPS(), // Only secure on HTTPS
            sameSite: 'lax' as const,
            path: '/'
        };

        const refreshOptions = {
            expires: 30,
            secure: this.isHTTPS(), // Only secure on HTTPS
            sameSite: 'lax' as const,
            path: '/'
        };

        Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, cookieOptions);
        Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, refreshOptions);
    }

    static getAccessToken(): string | undefined {
        return Cookies.get(this.ACCESS_TOKEN_KEY);
    }

    static getRefreshToken(): string | undefined {
        return Cookies.get(this.REFRESH_TOKEN_KEY);
    }

    static setUser(user: User): void {
        if (typeof window === 'undefined') return;
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
        Cookies.remove(this.ACCESS_TOKEN_KEY, { path: '/' });
        Cookies.remove(this.REFRESH_TOKEN_KEY, { path: '/' });

        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.USER_KEY);
        }
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

    // Debug method to check cookie issues
    static debugCookies(): void {
        if (typeof window === 'undefined') return;

        console.log('Debug Cookies:', {
            protocol: window.location.protocol,
            isHTTPS: this.isHTTPS(),
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken(),
            allCookies: document.cookie
        });
    }
}