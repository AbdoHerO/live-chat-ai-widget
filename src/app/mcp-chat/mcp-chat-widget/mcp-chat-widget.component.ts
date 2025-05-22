// mcp-chat-widget.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { McpService } from '../services/mcp.service';
import { MessageStorageService, ChatMessage, Conversation } from '../../chat/services/message-storage.service';

@Component({
  selector: 'app-mcp-chat-widget',
  templateUrl: './mcp-chat-widget.component.html',
  styleUrls: ['./mcp-chat-widget.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class McpChatWidgetComponent implements OnInit {
  isExpanded = false;
  activeTab: 'home' | 'chat' | 'help' | 'login' = 'home';
  conversations: Conversation[] = [];
  currentConversationId: string | null = null;
  currentMessages: ChatMessage[] = [];
  showConversation = false;
  isLoading = false;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private mcpService: McpService,
    private messageStorage: MessageStorageService
  ) {}

  async ngOnInit() {
    try {
      // Check if user is authenticated
      const authToken = localStorage.getItem('mcp_auth_token');
      this.isAuthenticated = !!authToken;

      // If not authenticated, show login tab
      if (!this.isAuthenticated) {
        this.activeTab = 'login';
      } else {
        // Load conversations if authenticated
        this.loadConversations();
      }
    } catch (error) {
      console.error('Error during initialization:', error);
      this.error = 'Erreur lors de l\'initialisation';
    }
  }

  async loadConversations() {
    try {
      this.conversations = await this.messageStorage.getConversations();

      // If there are conversations, load the most recent one
      if (this.conversations.length > 0) {
        this.currentConversationId = this.conversations[0].id!;
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.error = 'Erreur lors du chargement des conversations';
    }
  }

  handleLoginSuccess() {
    this.isAuthenticated = true;
    this.activeTab = 'home';
    this.loadConversations();
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
  }

  setActiveTab(tab: 'home' | 'chat' | 'help' | 'login') {
    // If not authenticated and trying to access a tab other than login, redirect to login
    if (!this.isAuthenticated && tab !== 'login') {
      this.activeTab = 'login';
      this.error = 'Veuillez vous connecter pour accéder à cette fonctionnalité';
      return;
    }

    this.activeTab = tab;

    // Reset conversation view when switching tabs
    if (tab !== 'chat') {
      this.showConversation = false;
    }
  }

  // Add this method to handle question from home screen
  async handleAskQuestion(question: string) {
    // Check if authenticated
    if (!this.isAuthenticated) {
      this.activeTab = 'login';
      this.error = 'Veuillez vous connecter pour poser une question';
      return;
    }

    this.activeTab = 'chat';

    if (this.currentConversationId) {
      await this.loadConversation(this.currentConversationId);
    } else {
      await this.startNewConversation();
    }

    this.showConversation = true;

    if (question) {
      this.sendMessage(question);
    }
  }

  // Handle article selection
  handleSelectArticle(articleId: string) {
    console.log('Selected article:', articleId);
    // Implementation for article selection
  }

  async startNewConversation() {
    try {
      this.isLoading = true;

      // Create conversation in MCP server
      this.mcpService.createConversation('Nouvelle Conversation').subscribe({
        next: async (response) => {
          // Create local conversation
          const conversationId = await this.messageStorage.createConversation(response.title);
          this.currentConversationId = conversationId;
          this.conversations = await this.messageStorage.getConversations();
          this.currentMessages = [];
          this.showConversation = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating conversation:', error);
          this.handleApiError('Erreur lors de la création de la conversation');
        }
      });
    } catch (error) {
      console.error('Error starting new conversation:', error);
      this.handleApiError('Erreur lors de la création de la conversation');
    }
  }

  async loadConversation(conversationId: string) {
    try {
      this.currentConversationId = conversationId;
      this.currentMessages = await this.messageStorage.getMessages(conversationId);
      this.showConversation = true;
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.error = 'Erreur lors du chargement de la conversation';
    }
  }

  async loadAndShowConversation(conversationId: string) {
    await this.loadConversation(conversationId);
  }

  async deleteConversation(conversationId: string, event: Event) {
    event.stopPropagation();

    try {
      await this.messageStorage.deleteConversation(conversationId);
      this.conversations = await this.messageStorage.getConversations();

      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
        this.currentMessages = [];
        this.showConversation = false;
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      this.error = 'Erreur lors de la suppression de la conversation';
    }
  }

  async updateConversationTitle(conversationId: string, title: string) {
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.title = title;
        await this.messageStorage.updateConversation(conversation);
        this.conversations = await this.messageStorage.getConversations();
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  }

  sendMessage(content: string) {
    if (!content.trim() || !this.currentConversationId) return;

    // Save user message
    const userMessage: ChatMessage = {
      conversationId: this.currentConversationId,
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    this.messageStorage.saveMessage(userMessage);
    this.currentMessages = [...this.currentMessages, userMessage];

    // Update title if first message
    this.messageStorage.getMessages(this.currentConversationId).then(messages => {
      if (messages.length === 1) {
        const title = content.split(' ').slice(0, 4).join(' ') + '...';
        this.updateConversationTitle(this.currentConversationId!, title);
      }
    });

    // Call MCP API
    this.isLoading = true;
    this.mcpService.sendMessage(content, this.currentConversationId).subscribe({
      next: async (response) => {
        const assistantMessage: ChatMessage = {
          conversationId: this.currentConversationId!,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(response.timestamp)
        };

        await this.messageStorage.saveMessage(assistantMessage);
        this.currentMessages = [...this.currentMessages, assistantMessage];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('MCP API error:', error);
        this.handleApiError('Erreur lors de la communication avec le serveur MCP');
      }
    });
  }

  handleApiError(message: string) {
    this.error = message;
    this.isLoading = false;

    // Add error message to conversation
    if (this.currentConversationId) {
      const errorMessage: ChatMessage = {
        conversationId: this.currentConversationId,
        role: 'system',
        content: `Erreur: ${message}. Veuillez réessayer.`,
        timestamp: new Date()
      };

      this.messageStorage.saveMessage(errorMessage);
      this.currentMessages = [...this.currentMessages, errorMessage];
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);

    // Same day
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // This week
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      return messageDate.toLocaleDateString(undefined, options);
    }

    // Older
    return messageDate.toLocaleDateString();
  }
}
