// mcp-chat-login.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { McpService } from '../services/mcp.service';
import { AuthService, BackendType } from '../services/auth.service';

@Component({
  selector: 'app-mcp-chat-login',
  templateUrl: './mcp-chat-login.component.html',
  styleUrls: ['./mcp-chat-login.component.scss']
})
export class McpChatLoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  selectedBackend: BackendType = 'win-mcp';

  constructor(
    private mcpService: McpService,
    private authService: AuthService
  ) {
    // Initialize backend selection
    this.selectedBackend = this.authService.getCurrentBackend() as BackendType;

    // Check if we already have a username
    const currentUsername = this.authService.getUsername();
    if (currentUsername) {
      this.username = currentUsername;
    }
  }
  
  /**
   * Handle backend selection change
   */
  onBackendChange(backend: BackendType): void {
    this.selectedBackend = backend;
    this.authService.setBackend(backend);
    this.error = null;

    // Clear form when switching backends
    this.username = '';
    this.password = '';
  }

  /**
   * Get backend display information
   */
  getBackendInfo() {
    return {
      name: this.authService.getBackendDisplayName(),
      authType: this.authService.getAuthTypeDisplay(),
      description: this.selectedBackend === 'chat-mcp'
        ? 'Système de démonstration avec authentification simple'
        : 'Système de pharmacie avec authentification duale (tenant + utilisateur)'
    };
  }

  login(): void {
    this.error = null;
    this.isLoading = true;

    if (!this.username || !this.password) {
      this.error = 'Veuillez entrer un nom d\'utilisateur et un mot de passe';
      this.isLoading = false;
      return;
    }

    // Validate Win-MCP credentials
    if (this.selectedBackend === 'win-mcp') {
      // Check if user is trying to enter tenant credentials instead of user credentials
      if (this.username === '0001' && this.password === '123456') {
        this.error = 'Vous avez entré les identifiants du tenant. Veuillez entrer vos identifiants utilisateur (ex: user1/password).\n\nNote: L\'authentification du tenant (0001/123456) se fait automatiquement.';
        this.isLoading = false;
        return;
      }

      // Validate that user is entering valid user credentials
      if (!['user1', 'user2'].includes(this.username)) {
        this.error = 'Pour Win-MCP, utilisez: user1/password ou user2/password\n\nL\'authentification du tenant se fait automatiquement.';
        this.isLoading = false;
        return;
      }
    }

    // Use the new AuthService for backend-specific authentication
    this.authService.authenticate(this.username, this.password).subscribe({
      next: (result) => {
        console.log(`✅ Authentication successful for ${result.authType} mode:`, result);
        this.isLoading = false;

        // Update MCP service with the username
        this.mcpService.setUsername(result.username);

        this.loginSuccess.emit();
      },
      error: (err) => {
        console.error('❌ Authentication failed:', err);
        this.isLoading = false;
        this.error = err.message || 'Erreur d\'authentification';
      }
    });
  }
  
  // For demo purposes, provide quick login options
  quickLogin(username: string): void {
    this.username = username;
    this.password = 'password'; // Default password for demo users
    this.login();
  }
}
