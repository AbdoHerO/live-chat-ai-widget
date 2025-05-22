// mcp-chat-home.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mcp-chat-home',
  templateUrl: './mcp-chat-home.component.html',
  styleUrls: ['./mcp-chat-home.component.scss']
})
export class McpChatHomeComponent {
  @Output() askQuestion = new EventEmitter<string>();
  @Output() selectArticle = new EventEmitter<string>();
  @Output() navigateToHelpTab = new EventEmitter<void>();
  
  suggestedQuestions: string[] = [
    'Comment puis-je accéder à mes informations personnelles ?',
    'Quelles sont les fonctionnalités disponibles ?',
    'Comment fonctionne la base de données MCP ?',
    'Pouvez-vous m\'aider avec la navigation ?'
  ];
  
  popularArticles = [
    { id: '1', title: 'Guide d\'utilisation MCP', icon: 'book-open-variant' },
    { id: '2', title: 'Fonctionnalités principales', icon: 'star' },
    { id: '3', title: 'FAQ', icon: 'frequently-asked-questions' },
    { id: '4', title: 'Contactez-nous', icon: 'email-outline' }
  ];
  
  onAskQuestion(question?: string): void {
    this.askQuestion.emit(question || '');
  }
  
  onSelectQuestion(question: string): void {
    this.askQuestion.emit(question);
  }
  
  onSelectArticle(articleId: string): void {
    this.selectArticle.emit(articleId);
  }
  
  onNavigateToHelp(): void {
    this.navigateToHelpTab.emit();
  }
}
