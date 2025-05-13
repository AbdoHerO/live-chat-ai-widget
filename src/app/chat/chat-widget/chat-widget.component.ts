// chat-widget.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { MessageStorageService, ChatMessage, Conversation } from '../services/message-storage.service';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class ChatWidgetComponent implements OnInit {
  isExpanded = false;
  activeTab = 'home'; // Change default to 'home'
  showConversation = false;
  conversations: Conversation[] = [];
  currentConversationId: string | null = null;
  currentMessages: ChatMessage[] = [];
  isLoading = false;
  threadId: string | null = null;

  constructor(
    private openaiService: OpenaiService,
    private messageStorage: MessageStorageService
  ) {}

  async ngOnInit() {
    this.conversations = await this.messageStorage.getConversations();
    
    if (this.conversations.length === 0) {
      // Create a default conversation if none exists
      const id = await this.messageStorage.createConversation('Nouvelle Conversation');
      this.conversations = await this.messageStorage.getConversations();
      this.currentConversationId = id;
    } else {
      this.currentConversationId = this.conversations[0].id!;
    }
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded) {
      // Reset to home view when closing
      this.activeTab = 'home';
      this.showConversation = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'chat') {
      // Reset to conversation list when switching to chat tab
      this.showConversation = false;
    }
  }


  // Add this method to handle question from home screen
  async handleAskQuestion(question: string) {
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
  
  // Add this method to handle article selection
  async handleSelectArticle(articleId: string) {
    // Here you could navigate to article content
    // For now, let's just start a conversation about the article
    this.activeTab = 'chat';
    await this.startNewConversation();
    this.showConversation = true;
    
    let message = '';
    switch(articleId) {
      case 'spring25':
        message = "Tell me about the Built For You Spring 25 AI innovations";
        break;
      case '2025report':
        message = "What's in the 2025 Customer Service Transformation Report?";
        break;
      case 'community':
        message = "How can I join the Intercom Community?";
        break;
      default:
        message = "I'd like to learn more about " + articleId;
    }
    
    this.sendMessage(message);
  }

  async startNewConversation() {
    const id = await this.messageStorage.createConversation();
    this.conversations = await this.messageStorage.getConversations();
    this.loadAndShowConversation(id);
  }

  async loadConversation(id: string) {
    this.currentConversationId = id;
    this.currentMessages = await this.messageStorage.getMessages(id);
  }

  async loadAndShowConversation(id: string) {
    await this.loadConversation(id);
    this.showConversation = true;
  }

  showConversationList() {
    this.showConversation = false;
  }

  async deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    await this.messageStorage.deleteConversation(id);
    this.conversations = await this.messageStorage.getConversations();
    
    if (id === this.currentConversationId) {
      if (this.conversations.length > 0) {
        this.currentConversationId = this.conversations[0].id!;
      } else {
        const newId = await this.messageStorage.createConversation();
        this.conversations = await this.messageStorage.getConversations();
        this.currentConversationId = newId;
      }
    }
  }

  async sendMessage(content: string) {
  if (!content.trim() || !this.currentConversationId) return;

  // Sauvegarder le message utilisateur (comme avant)
  const userMessage: ChatMessage = {
    conversationId: this.currentConversationId,
    role: 'user',
    content: content,
    timestamp: new Date()
  };
  
  await this.messageStorage.saveMessage(userMessage);
  this.currentMessages = [...this.currentMessages, userMessage];

  // Mise à jour du titre si nécessaire (comme avant)
  const messages = await this.messageStorage.getMessages(this.currentConversationId);
  if (messages.length === 1) {
    const title = content.split(' ').slice(0, 4).join(' ') + '...';
    await this.updateConversationTitle(this.currentConversationId, title);
  }

  // Appel à l'API avec réutilisation du thread
  this.isLoading = true;
  this.openaiService.sendMessage(content, this.threadId || undefined).subscribe({
    next: async (response) => {
      if (response && response.message) {
        // Stocker l'ID du thread pour la prochaine utilisation
        this.threadId = response.threadId;
        
        const assistantMessage: ChatMessage = {
          conversationId: this.currentConversationId!,
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };
        
        await this.messageStorage.saveMessage(assistantMessage);
        this.currentMessages = [...this.currentMessages, assistantMessage];
      } else {
        console.error('Unexpected API response format:', response);
        this.handleApiError('Unexpected response format from API');
      }
      this.isLoading = false;
    },
    error: (error) => {
      this.handleApiError(error);
      this.threadId = null; // Réinitialiser en cas d'erreur
    }
  });
}

  handleApiError(error: any) {
    console.error('Error getting response:', error);
    // Add an error message to the conversation
    const errorMessage: ChatMessage = {
      conversationId: this.currentConversationId!,
      role: 'assistant',
      content: "I'm sorry, I encountered an error processing your request. Please check your API key configuration or try again later.",
      timestamp: new Date()
    };
    
    this.messageStorage.saveMessage(errorMessage);
    this.currentMessages = [...this.currentMessages, errorMessage];
    this.isLoading = false;
  }

  async updateConversationTitle(id: string, title: string) {
    // Find the conversation and update its title
    const conversation = this.conversations.find(c => c.id === id);
    if (conversation) {
      conversation.title = title;
      // Assuming you have a method to update a conversation
      // If not, you'll need to add this to your MessageStorageService
      await this.messageStorage.updateConversation(conversation);
      this.conversations = await this.messageStorage.getConversations();
    }
  }

  handleHelpSelection(question: string) {
    this.activeTab = 'chat';
    this.loadAndShowConversation(this.currentConversationId!);
    this.sendMessage(question);
  }

  getCurrentConversationTitle(): string {
    const conversation = this.conversations.find(c => c.id === this.currentConversationId);
    return conversation ? conversation.title : 'Chat';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    
    // If today, show time only
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
