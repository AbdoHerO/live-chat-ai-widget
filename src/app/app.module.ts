import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { McpChatModule } from './mcp-chat/mcp-chat.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // Import both modules, but we'll conditionally display the components
    ChatModule,
    McpChatModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
