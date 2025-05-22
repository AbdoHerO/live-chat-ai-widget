// mcp-chat-conversation.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ChatMessage } from '../../chat/services/message-storage.service';

@Component({
  selector: 'app-mcp-chat-conversation',
  templateUrl: './mcp-chat-conversation.component.html',
  styleUrls: ['./mcp-chat-conversation.component.scss']
})
export class McpChatConversationComponent {
  @Input() messages: ChatMessage[] = [];
  @Input() loading = false;
  @Output() sendMessage = new EventEmitter<string>();
  
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  onEnterPress(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessageFromInput(input);
    }
  }
  
  sendMessageManually(input: HTMLTextAreaElement): void {
    this.sendMessageFromInput(input);
  }
  
  private sendMessageFromInput(input: HTMLTextAreaElement): void {
    const message = input.value.trim();
    if (message && !this.loading) {
      this.sendMessage.emit(message);
      input.value = '';
      this.adjustTextareaHeight(input);
    }
  }
  
  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }
  
  formatMessage(content: string): string {
    if (!content) return '';
    
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    // Convert markdown-style links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    content = content.replace(markdownLinkRegex, '<a href="$2" target="_blank">$1</a>');
    
    // Convert markdown-style bold **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    content = content.replace(boldRegex, '<strong>$1</strong>');
    
    // Convert markdown-style italic *text*
    const italicRegex = /\*([^*]+)\*/g;
    content = content.replace(italicRegex, '<em>$1</em>');
    
    // Convert line breaks to <br>
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }
}
