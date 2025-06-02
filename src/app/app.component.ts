import { Component, OnInit } from '@angular/core';
import { environment } from './environments/environment';
import { AuthService } from './mcp-chat/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-openai-chat-2';
  useMcpServer = true; // Default to MCP server

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Initialize from environment
    this.useMcpServer = environment.useMcpServer;

    // Check if there's a saved preference in localStorage
    const savedPreference = localStorage.getItem('useMcpServer');
    if (savedPreference !== null) {
      this.useMcpServer = savedPreference === 'true';
    }
  }

  toggleChatMode(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.useMcpServer = select.value === 'mcp';

    // Save preference to localStorage
    localStorage.setItem('useMcpServer', this.useMcpServer.toString());

    // Reload the page to apply the change
    // This is a simple approach - in a more complex app, you might want to handle this differently
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentBackend(): string {
    return this.authService.getCurrentBackend();
  }

  getCurrentUsername(): string {
    return this.authService.getCurrentUsername() || 'Utilisateur';
  }

  logout(): void {
    this.authService.logout();
    // Reload to reset the MCP widget state
    window.location.reload();
  }
}
