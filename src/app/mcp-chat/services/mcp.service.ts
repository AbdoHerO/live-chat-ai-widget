// mcp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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
  timestamp: string;
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
    // For now, we'll skip authentication since the MCP server doesn't require it
    const chatRequest: McpChatRequest = {
      conversationId,
      content,
      username: this.username
    };

    console.log('Sending request to MCP server:', `${this.baseUrl}/api/chat`, chatRequest);

    return this.http.post<McpChatResponse>(
      `${this.baseUrl}/api/chat`,
      chatRequest
    ).pipe(
      tap(response => console.log('MCP server response:', response)),
      catchError(err => {
        console.error('MCP Chat error:', err);
        return throwError(() => new Error('Erreur lors de la communication avec le serveur MCP. Veuillez réessayer.'));
      })
    );
  }

  // Create a new conversation
  createConversation(title: string = 'Nouvelle Conversation'): Observable<McpConversationResponse> {
    // Since the MCP server doesn't have a dedicated endpoint for creating conversations,
    // we'll simulate it by sending a message to a new conversation ID
    const conversationId = this.generateUniqueId();

    // Create a mock conversation response
    const mockResponse: McpConversationResponse = {
      id: conversationId,
      title: title,
      username: this.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Return the mock response as an Observable
    return new Observable<McpConversationResponse>(observer => {
      observer.next(mockResponse);
      observer.complete();
    });
  }

  // Generate a unique ID for new conversations
  private generateUniqueId(): string {
    return 'conv-' + Math.random().toString(36).substring(2, 11) +
           '-' + Date.now().toString(36);
  }

  // Get all conversations for the current user
  getUserConversations(): Observable<McpConversationResponse[]> {
    // Since the MCP server doesn't have a dedicated endpoint for getting conversations,
    // we'll return an empty array for now
    return new Observable<McpConversationResponse[]>(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
