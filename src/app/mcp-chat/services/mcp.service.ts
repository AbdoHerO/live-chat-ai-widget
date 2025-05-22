// mcp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface McpChatRequest {
  conversationId: string;
  content: string;
  username: string;
}

export interface McpChatResponse {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  timestamp: Date;
}

export interface McpConversationRequest {
  username: string;
  title: string;
}

export interface McpConversationResponse {
  id: string;
  title: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface McpAuthRequest {
  username: string;
  password: string;
}

export interface McpAuthResponse {
  token: string;
  username: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class McpService {
  private baseUrl = environment.mcpServerUrl || 'http://localhost:8081';
  private authToken: string | null = null;
  private username: string = 'user1'; // Default username

  constructor(private http: HttpClient) {
    // Try to load token from localStorage
    const savedToken = localStorage.getItem('mcp_auth_token');
    if (savedToken) {
      this.authToken = savedToken;
    }

    const savedUsername = localStorage.getItem('mcp_username');
    if (savedUsername) {
      this.username = savedUsername;
    }
  }

  // Set username
  setUsername(username: string): void {
    this.username = username;
    localStorage.setItem('mcp_username', username);
  }

  // Get username
  getUsername(): string {
    return this.username;
  }

  // Get auth headers
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    return headers;
  }

  // Authenticate with the MCP server
  authenticate(username: string, password: string): Observable<McpAuthResponse> {
    const authRequest: McpAuthRequest = { username, password };

    return this.http.post<McpAuthResponse>(`${this.baseUrl}/auth/login`, authRequest)
      .pipe(
        map(response => {
          this.authToken = response.token;
          this.username = response.username;

          // Save to localStorage
          localStorage.setItem('mcp_auth_token', response.token);
          localStorage.setItem('mcp_username', response.username);

          return response;
        }),
        catchError(err => {
          console.error('MCP Authentication error:', err);
          return throwError(() => new Error(err.message || 'Erreur d\'authentification'));
        })
      );
  }

  // Send a message to the MCP server
  sendMessage(content: string, conversationId: string): Observable<McpChatResponse> {
    // Check if authenticated
    if (!this.authToken) {
      // Try to authenticate with default credentials first
      return this.authenticate(this.username, 'password').pipe(
        switchMap(() => this.sendMessageWithAuth(content, conversationId)),
        catchError(err => {
          console.error('Authentication failed:', err);
          return throwError(() => new Error('Veuillez vous authentifier avant d\'envoyer un message'));
        })
      );
    }

    return this.sendMessageWithAuth(content, conversationId);
  }

  // Helper method to send message after authentication
  private sendMessageWithAuth(content: string, conversationId: string): Observable<McpChatResponse> {
    const chatRequest: McpChatRequest = {
      conversationId,
      content,
      username: this.username
    };

    return this.http.post<McpChatResponse>(
      `${this.baseUrl}/chat/message`,
      chatRequest,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        // If unauthorized, try to re-authenticate
        if (err.status === 401) {
          return this.authenticate(this.username, 'password').pipe(
            switchMap(() => this.sendMessageWithAuth(content, conversationId))
          );
        }
        console.error('MCP Chat error:', err);
        return throwError(() => new Error(err.message || 'Erreur lors de l\'envoi du message'));
      })
    );
  }

  // Create a new conversation
  createConversation(title: string = 'Nouvelle Conversation'): Observable<McpConversationResponse> {
    // Check if authenticated
    if (!this.authToken) {
      // Try to authenticate with default credentials first
      return this.authenticate(this.username, 'password').pipe(
        switchMap(() => this.createConversationWithAuth(title)),
        catchError(err => {
          console.error('Authentication failed:', err);
          return throwError(() => new Error('Veuillez vous authentifier avant de créer une conversation'));
        })
      );
    }

    return this.createConversationWithAuth(title);
  }

  // Helper method to create conversation after authentication
  private createConversationWithAuth(title: string): Observable<McpConversationResponse> {
    const conversationRequest: McpConversationRequest = {
      username: this.username,
      title
    };

    return this.http.post<McpConversationResponse>(
      `${this.baseUrl}/conversations`,
      conversationRequest,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        // If unauthorized, try to re-authenticate
        if (err.status === 401) {
          return this.authenticate(this.username, 'password').pipe(
            switchMap(() => this.createConversationWithAuth(title))
          );
        }
        console.error('MCP Create Conversation error:', err);
        return throwError(() => new Error(err.message || 'Erreur lors de la création de la conversation'));
      })
    );
  }

  // Get all conversations for the current user
  getUserConversations(): Observable<McpConversationResponse[]> {
    // Check if authenticated
    if (!this.authToken) {
      // Try to authenticate with default credentials first
      return this.authenticate(this.username, 'password').pipe(
        switchMap(() => this.getUserConversationsWithAuth()),
        catchError(err => {
          console.error('Authentication failed:', err);
          return throwError(() => new Error('Veuillez vous authentifier avant de récupérer les conversations'));
        })
      );
    }

    return this.getUserConversationsWithAuth();
  }

  // Helper method to get conversations after authentication
  private getUserConversationsWithAuth(): Observable<McpConversationResponse[]> {
    return this.http.get<McpConversationResponse[]>(
      `${this.baseUrl}/conversations/user/${this.username}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        // If unauthorized, try to re-authenticate
        if (err.status === 401) {
          return this.authenticate(this.username, 'password').pipe(
            switchMap(() => this.getUserConversationsWithAuth())
          );
        }
        console.error('MCP Get Conversations error:', err);
        return throwError(() => new Error(err.message || 'Erreur lors de la récupération des conversations'));
      })
    );
  }
}
