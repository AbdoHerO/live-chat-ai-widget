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
  knowledgeMode: 'general' | 'internal' = 'internal'; // Default to internal (RAG) mode
  isAuthenticated = true; // For Direct OpenAI, always authenticated

  constructor(
    private openaiService: OpenaiService,
    private messageStorage: MessageStorageService
  ) {}

  async ngOnInit() {
    // Load knowledge mode preference from localStorage
    const savedKnowledgeMode = localStorage.getItem('openai_knowledge_mode') as 'general' | 'internal';
    if (savedKnowledgeMode) {
      this.knowledgeMode = savedKnowledgeMode;
    }

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

  // Toggle between general and internal knowledge modes
  toggleKnowledgeMode() {
    this.knowledgeMode = this.knowledgeMode === 'general' ? 'internal' : 'general';
    console.log('🔄 OpenAI Knowledge mode changed to:', this.knowledgeMode);

    // Save the preference to localStorage
    localStorage.setItem('openai_knowledge_mode', this.knowledgeMode);
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

  // Format the message based on knowledge mode before sending to OpenAI
  const formattedMessage = this.formatMessageWithKnowledgeMode(content);
  console.log('🧠 OpenAI: Using knowledge mode:', this.knowledgeMode);
  console.log('📝 OpenAI: Original message:', content);
  console.log('🔄 OpenAI: Formatted message:', formattedMessage);

  // Appel à l'API avec réutilisation du thread
  this.isLoading = true;
  this.openaiService.sendMessage(formattedMessage, this.threadId || undefined).subscribe({
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

  /**
   * Format the user message with the selected knowledge mode option
   * This prepends the option selection to the message in the background
   */
  private formatMessageWithKnowledgeMode(originalMessage: string): string {
    // Check if this is a greeting message (no need to add option for greetings)
    const greetingPatterns = [
      /^(bonjour|salut|hello|hi|hey|bonsoir|good morning|good afternoon|good evening)$/i,
      /^(comment ça va|comment vas-tu|how are you|ça va|how's it going)$/i,
      /^(merci|thank you|thanks)$/i
    ];

    const isGreeting = greetingPatterns.some(pattern => pattern.test(originalMessage.trim()));

    if (isGreeting) {
      // For greetings, send the message as-is without option selection
      return originalMessage;
    }

    // For questions, prepend the option selection based on the toggle
    const optionNumber = this.knowledgeMode === 'internal' ? '1' : '2';

    // Format: "[BACKGROUND_OPTION: X] Original user question"
    // This tells the assistant which option was selected without showing it to the user
    return `[OPTION_UTILISATEUR: ${optionNumber}] ${originalMessage}`;
  }
}
