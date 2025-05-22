import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { McpChatWidgetComponent } from './mcp-chat-widget/mcp-chat-widget.component';
import { McpChatConversationComponent } from './mcp-chat-conversation/mcp-chat-conversation.component';
import { McpChatHomeComponent } from './mcp-chat-home/mcp-chat-home.component';
import { McpChatHelpComponent } from './mcp-chat-help/mcp-chat-help.component';
import { McpChatLoginComponent } from './mcp-chat-login/mcp-chat-login.component';

@NgModule({
  declarations: [
    McpChatWidgetComponent,
    McpChatConversationComponent,
    McpChatHomeComponent,
    McpChatHelpComponent,
    McpChatLoginComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    McpChatWidgetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class McpChatModule { }
