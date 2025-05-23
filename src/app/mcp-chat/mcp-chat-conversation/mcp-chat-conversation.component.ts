// mcp-chat-conversation.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { ChatMessage } from '../../chat/services/message-storage.service';

@Component({
  selector: 'app-mcp-chat-conversation',
  templateUrl: './mcp-chat-conversation.component.html',
  styleUrls: ['./mcp-chat-conversation.component.scss']
})
export class McpChatConversationComponent implements OnChanges {
  @Input() messages: ChatMessage[] = [];
  @Input() loading = false;
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('messageInput') messageInput!: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }

  onEnterPress(event: KeyboardEvent, inputElement: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessageManually(inputElement);
    }
  }

  sendMessageManually(input: HTMLTextAreaElement): void {
    if (input.value.trim() && !this.loading) {
      this.sendMessage.emit(input.value);
      input.value = '';

      // Reset textarea height
      input.style.height = '24px';
    }
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = '24px';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
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

  formatMessage(content: string): string {
    if (!content) return '';

    // Enhanced markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');

    return formatted;
  }

  formatTime(timestamp: Date | string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();

    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // This week
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      return date.toLocaleDateString(undefined, options);
    }

    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
