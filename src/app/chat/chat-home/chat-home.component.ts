// src/app/chat/components/chat-home.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-home',
  templateUrl: './chat-home.component.html',
  styleUrls: ['./chat-home.component.scss']
})
export class ChatHomeComponent {
  @Output() askQuestion = new EventEmitter<string>();
  @Output() selectArticle = new EventEmitter<string>();
  
  featuredArticles = [
    {
      id: 'spring25',
      title: 'Built For You',
      subtitle: 'Spring 25',
      image: 'assets/spring25.jpg',
      description: 'See the latest breakthroughs in AI customer service',
      content: 'Watch the Built For You Spring 25 recap to discover Intercom\'s latest AI innovations that will help you deliver incredible customer service.'
    },
    {
      id: '2025report',
      title: 'THE 2025 CUSTOMER SERVICE TRANSFORMATION REPORT',
      image: 'assets/report.jpg',
      description: 'The 2025 Customer Service Transformation Report is here',
      content: 'Learn how AI has transformed customer service from the ground up—rewriting its economics, reshaping customer expectations, and unlocking new levels of scalability.'
    },
    {
      id: 'community',
      title: 'The Intercom Community',
      description: '',
      content: 'Be sure to check out the Intercom Community for support, plus tips & tricks from Intercom users and much more'
    }
  ];
  
  suggestedQuestions = [
    { id: 'fin-guidance', text: 'Provide Fin AI Agent with specific guidance' },
    { id: 'optimize-fin', text: 'Top ten ways to optimize Fin' },
    { id: 'help-center', text: 'Optimize your Help Center collections' },
    { id: 'repeatable-messages', text: 'Send repeatable messages based on events you track in Intercom' }
  ];
  
  onAskQuestion() {
    this.askQuestion.emit('');
  }
  
  onSelectQuestion(question: string) {
    this.askQuestion.emit(question);
  }
  
  onSelectArticle(articleId: string) {
    this.selectArticle.emit(articleId);
  }
}
