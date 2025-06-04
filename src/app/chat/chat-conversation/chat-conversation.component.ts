// chat-conversation.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ChatMessage } from '../services/message-storage.service';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom
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

      // Reset textarea height to minimum
      inputElement.style.height = 'auto';
      inputElement.style.height = '24px';
      inputElement.style.overflowY = 'hidden';

      // Auto-focus the textarea for next message
      setTimeout(() => {
        inputElement.focus();
      }, 100);
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

  // Professional auto-resize textarea based on content lines
  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    // Reset height to auto to get the natural height
    textarea.style.height = 'auto';

    // Calculate the number of lines
    const lineHeight = 24; // Base line height in pixels
    const maxHeight = lineHeight * 6; // Maximum 6 lines
    const minHeight = lineHeight * 1; // Minimum 1 line

    // Get the scroll height (natural content height)
    const scrollHeight = textarea.scrollHeight;

    // Set height based on content, but within min/max bounds
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';

    // Enable scrolling if content exceeds max height
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
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
