// chat-help.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

interface HelpCategory {
  name: string;
  questions: string[];
}

@Component({
  selector: 'app-chat-help',
  templateUrl: './chat-help.component.html',
  styleUrls: ['./chat-help.component.scss']
})
export class ChatHelpComponent {
  @Output() selectHelp = new EventEmitter<string>();
  
  helpCategories: HelpCategory[] = [
    {
      name: 'Getting Started',
      questions: [
        'How do I create a new website?',
        'What hosting plan should I choose?',
        'How do I connect my domain?'
      ]
    },
    {
      name: 'Account Management',
      questions: [
        'How do I change my password?',
        'How do I update billing information?',
        'How to cancel my subscription?'
      ]
    },
    {
      name: 'Technical Support',
      questions: [
        'My website is down, what should I do?',
        'How do I set up SSL?',
        'How to configure email accounts?'
      ]
    }
  ];
  
  selectQuestion(question: string) {
    this.selectHelp.emit(question);
  }
}
