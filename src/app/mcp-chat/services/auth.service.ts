import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId?: number;
  email?: string;
}

export interface DualAuthResult {
  tenantToken: string;
  userToken: string;
  username: string;
  authType: 'SINGLE' | 'DUAL';
}

export type BackendType = 'chat-mcp' | 'win-mcp';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentBackend: BackendType = 'win-mcp';
  private tenantToken: string | null = null;
  private userToken: string | null = null;
  private username: string | null = null;

  constructor(private http: HttpClient) {
    // Load saved backend preference
    const savedBackend = localStorage.getItem('selected_backend') as BackendType;
    if (savedBackend) {
      this.currentBackend = savedBackend;
    } else {
      this.currentBackend = environment.defaultBackend as BackendType;
    }

    // Load saved tokens
    this.tenantToken = localStorage.getItem('tenant_token');
    this.userToken = localStorage.getItem('user_token');
    this.username = localStorage.getItem('auth_username');
  }

  /**
   * Set the current backend
   */
  setBackend(backend: BackendType): void {
    this.currentBackend = backend;
    localStorage.setItem('selected_backend', backend);
    
    // Clear tokens when switching backends
    this.clearTokens();
  }

  /**
   * Get the current backend
   */
  // getCurrentBackend(): BackendType {
  //   return this.currentBackend;
  // }

  /**
   * Get backend URL
   */
  private getBackendUrl(): string {
    return this.currentBackend === 'chat-mcp' ? environment.chatMcpUrl : environment.winMcpUrl;
  }

  /**
   * Get authentication configuration for current backend
   */
  private getAuthConfig() {
    return this.currentBackend === 'chat-mcp' ? environment.authConfig.chatMcp : environment.authConfig.winMcp;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.currentBackend === 'chat-mcp') {
      return !!this.userToken;
    } else {
      // For Win-MCP, we need both tokens for dual auth
      return !!(this.tenantToken && this.userToken);
    }
  }

  /**
   * Get current username
   */
  getUsername(): string | null {
    return this.username;
  }

  /**
   * Authenticate user based on current backend
   */
  authenticate(username: string, password: string): Observable<DualAuthResult> {
    if (this.currentBackend === 'chat-mcp') {
      return this.authenticateChatMcp(username, password);
    } else {
      return this.authenticateWinMcp(username, password);
    }
  }

  /**
   * Single authentication for Chat-MCP
   */
  private authenticateChatMcp(username: string, password: string): Observable<DualAuthResult> {
    const authRequest: AuthRequest = { username, password };
    const config = this.getAuthConfig();
    const url = `${this.getBackendUrl()}${(config.endpoints as any).login}`;

    console.log('🔐 Chat-MCP: Single authentication for:', username);

    return this.http.post<AuthResponse>(url, authRequest).pipe(
      map(response => {
        this.userToken = response.token;
        this.username = response.username;
        
        // Save to localStorage
        localStorage.setItem('user_token', response.token);
        localStorage.setItem('auth_username', response.username);
        localStorage.removeItem('tenant_token'); // Clear tenant token for Chat-MCP
        
        console.log('✅ Chat-MCP: Single authentication successful');
        
        return {
          tenantToken: '',
          userToken: response.token,
          username: response.username,
          authType: 'SINGLE' as const
        };
      }),
      catchError(err => {
        console.error('❌ Chat-MCP: Authentication failed:', err);
        return throwError(() => new Error(err.message || 'Erreur d\'authentification Chat-MCP'));
      })
    );
  }

  /**
   * Dual authentication for Win-MCP
   */
  private authenticateWinMcp(username: string, password: string): Observable<DualAuthResult> {
    console.log('🔐 Win-MCP: Starting dual authentication for:', username);
    
    // Step 1: Authenticate tenant
    return this.authenticateTenant().pipe(
      switchMap(tenantToken => {
        // Step 2: Authenticate user with tenant token
        return this.authenticateUser(username, password, tenantToken).pipe(
          map(userToken => {
            this.tenantToken = tenantToken;
            this.userToken = userToken;
            this.username = username;
            
            // Save to localStorage
            localStorage.setItem('tenant_token', tenantToken);
            localStorage.setItem('user_token', userToken);
            localStorage.setItem('auth_username', username);
            
            console.log('✅ Win-MCP: Dual authentication successful');
            
            return {
              tenantToken,
              userToken,
              username,
              authType: 'DUAL' as const
            };
          })
        );
      }),
      catchError(err => {
        console.error('❌ Win-MCP: Dual authentication failed:', err);
        return throwError(() => new Error(err.message || 'Erreur d\'authentification Win-MCP'));
      })
    );
  }

  /**
   * Authenticate tenant for Win-MCP
   */
  private authenticateTenant(): Observable<string> {
    const config = this.getAuthConfig();
    const tenantConfig = (config as any).tenant;
    const authRequest: AuthRequest = {
      username: tenantConfig.username,
      password: tenantConfig.password
    };
    const url = `${this.getBackendUrl()}${(config.endpoints as any).tenantLogin}`;

    console.log('🏥 Win-MCP: Authenticating tenant...');

    return this.http.post<AuthResponse>(url, authRequest).pipe(
      map(response => {
        console.log('✅ Win-MCP: Tenant authentication successful');
        return response.token;
      }),
      catchError(err => {
        console.error('❌ Win-MCP: Tenant authentication failed:', err);
        return throwError(() => new Error('Erreur d\'authentification du tenant'));
      })
    );
  }

  /**
   * Authenticate user for Win-MCP with tenant token
   */
  private authenticateUser(username: string, password: string, tenantToken: string): Observable<string> {
    const config = this.getAuthConfig();
    const authRequest: AuthRequest = { username, password };
    const url = `${this.getBackendUrl()}${(config.endpoints as any).userLogin}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'AuthorizationTenant': `BearerTenant ${tenantToken}`
    });

    console.log('👤 Win-MCP: Authenticating user with tenant token...');

    return this.http.post<AuthResponse>(url, authRequest, { headers }).pipe(
      map(response => {
        console.log('✅ Win-MCP: User authentication successful');
        return response.token;
      }),
      catchError(err => {
        console.error('❌ Win-MCP: User authentication failed:', err);
        return throwError(() => new Error('Erreur d\'authentification utilisateur'));
      })
    );
  }

  /**
   * Get authentication headers for API calls
   */
  getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.currentBackend === 'chat-mcp') {
      // Single authentication for Chat-MCP
      if (this.userToken) {
        headers = headers.set('Authorization', `Bearer ${this.userToken}`);
      }
    } else {
      // Dual authentication for Win-MCP
      if (this.tenantToken) {
        headers = headers.set('AuthorizationTenant', `BearerTenant ${this.tenantToken}`);
      }
      if (this.userToken) {
        headers = headers.set('Authorization', `Bearer ${this.userToken}`);
      }
    }

    return headers;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    this.tenantToken = null;
    this.userToken = null;
    this.username = null;
    
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('user_token');
    localStorage.removeItem('auth_username');
  }

  /**
   * Get backend display name
   */
  getBackendDisplayName(): string {
    return this.currentBackend === 'chat-mcp' ? 'Chat-MCP (Démo)' : 'Win-MCP (Pharmacie)';
  }

  /**
   * Get authentication type display
   */
  getAuthTypeDisplay(): string {
    return this.currentBackend === 'chat-mcp' ? 'Authentification Simple' : 'Authentification Duale (Tenant + Utilisateur)';
  }

  /**
   * Get current username
   */
  getCurrentUsername(): string | null {
    return this.username;
  }

  /**
   * Get current backend
   */
  getCurrentBackend(): string {
    return this.currentBackend === 'chat-mcp' ? 'Chat-MCP' : 'Win-MCP';
  }

  /**
   * Get username (alias for getCurrentUsername for compatibility)
   */
  // getUsername(): string | null {
  //   return this.username;
  // }
}
