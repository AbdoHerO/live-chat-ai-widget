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
    'Quel est mon solde actuel ?',
    'Quand est ma prochaine échéance de paiement ?',
    'Quelles sont mes dernières transactions ?',
    'Quel est mon numéro de client ?',
    'Quand expire ma carte bancaire ?',
    'Quel est mon historique de paiement ?',
    'Ai-je des factures impayées ?',
    'Quelle est mon adresse enregistrée ?'
  ];

  popularArticles = [
    { id: '1', title: 'Comment consulter mon profil client', icon: 'account' },
    { id: '2', title: 'Gérer mes moyens de paiement', icon: 'credit-card' },
    { id: '3', title: 'Comprendre mon relevé mensuel', icon: 'file-document' },
    { id: '4', title: 'Sécurité de mes données personnelles', icon: 'shield-check' },
    { id: '5', title: 'Contactez le service client', icon: 'headset' }
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
