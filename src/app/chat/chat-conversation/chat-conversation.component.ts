// chat-conversation.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ChatMessage } from '../services/message-storage.service';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnChanges {
  @Input() messages: ChatMessage[] = [];
  @Input() loading = false;
  @Output() sendMessage = new EventEmitter<string>();
  
  @ViewChild('messageInput') messageInput: ElementRef | undefined;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }

  onEnterPress(event: KeyboardEvent, inputElement: HTMLTextAreaElement) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessageManually(inputElement);
    }
  }

  sendMessageManually(inputElement: HTMLTextAreaElement) {
    if (inputElement.value.trim()) {
      this.sendMessage.emit(inputElement.value);
      inputElement.value = '';
      
      // Reset textarea height
      inputElement.style.height = '24px';
    }
  }

  formatMessage(content: string): string {
    // Enhanced markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
    
    return formatted;
  }

  // Auto-resize textarea as user types
  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = '24px';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  private scrollToBottom(): void {
    try {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}