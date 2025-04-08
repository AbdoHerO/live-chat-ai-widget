// chat.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatHelpComponent } from './chat-help/chat-help.component';
import { ChatHomeComponent } from './chat-home/chat-home.component';

@NgModule({
  declarations: [
    ChatWidgetComponent,
    ChatConversationComponent,
    ChatHelpComponent,
    ChatHomeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [
    ChatWidgetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class ChatModule { }
