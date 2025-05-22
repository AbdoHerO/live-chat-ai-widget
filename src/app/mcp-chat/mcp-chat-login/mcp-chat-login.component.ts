// mcp-chat-login.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { McpService } from '../services/mcp.service';

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
  
  constructor(private mcpService: McpService) {
    // Check if we already have a username in the service
    const currentUsername = this.mcpService.getUsername();
    if (currentUsername) {
      this.username = currentUsername;
    }
  }
  
  login(): void {
    this.error = null;
    this.isLoading = true;
    
    if (!this.username || !this.password) {
      this.error = 'Veuillez entrer un nom d\'utilisateur et un mot de passe';
      this.isLoading = false;
      return;
    }
    
    this.mcpService.authenticate(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginSuccess.emit();
      },
      error: (err) => {
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
