// src/app/chat/services/message-storage.service.ts
import { Injectable } from '@angular/core';

export interface ChatMessage {
  id?: number;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id?: string;
  title: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageStorageService {
  private conversations: Conversation[] = [];
  private messages: ChatMessage[] = [];

  constructor() {
    // Load from localStorage if available
    const savedConversations = localStorage.getItem('conversations');
    const savedMessages = localStorage.getItem('messages');
    
    if (savedConversations) {
      this.conversations = JSON.parse(savedConversations);
    }
    
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
      // Convert string dates back to Date objects
      this.messages.forEach(msg => {
        msg.timestamp = new Date(msg.timestamp);
      });
    }
  }

  private saveToStorage() {
    localStorage.setItem('conversations', JSON.stringify(this.conversations));
    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

  async createConversation(title: string = 'Nouvelle Conversation'): Promise<string> {
    const id = Date.now().toString();
    this.conversations.push({
      id,
      title,
      lastUpdated: new Date()
    });
    this.saveToStorage();
    return id;
  }

  async getConversations(): Promise<Conversation[]> {
    return [...this.conversations].sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async saveMessage(message: ChatMessage): Promise<number> {
    const id = this.messages.length > 0 ? 
      Math.max(...this.messages.map(m => m.id || 0)) + 1 : 1;
    
    const newMessage = {
      ...message,
      id
    };
    
    this.messages.push(newMessage);
    
    // Update conversation lastUpdated
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastUpdated = new Date();
    }
    
    this.saveToStorage();
    return id;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.messages = this.messages.filter(msg => msg.conversationId !== conversationId);
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
    this.saveToStorage();
  }

  async updateConversation(conversation: Conversation): Promise<void> {
    const index = this.conversations.findIndex(c => c.id === conversation.id);
    if (index !== -1) {
      this.conversations[index] = { ...conversation };
      this.saveToStorage();
    }
  }
}
