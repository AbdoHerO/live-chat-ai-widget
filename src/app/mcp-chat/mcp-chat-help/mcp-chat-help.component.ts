// mcp-chat-help.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-mcp-chat-help',
  templateUrl: './mcp-chat-help.component.html',
  styleUrls: ['./mcp-chat-help.component.scss']
})
export class McpChatHelpComponent {
  helpSections = [
    {
      title: 'Commencer une conversation',
      content: 'Cliquez sur l\'onglet "Chat" puis sur "Nouvelle Conversation" pour démarrer une discussion avec l\'assistant MCP.'
    },
    {
      title: 'Poser une question',
      content: 'Tapez votre question dans la zone de texte en bas de l\'écran et appuyez sur Entrée ou cliquez sur le bouton d\'envoi.'
    },
    {
      title: 'Choisir une source d\'information',
      content: 'Lorsque vous posez une question, l\'assistant vous demandera de choisir entre la base de données MCP (pour vos informations personnelles) ou les connaissances générales.'
    },
    {
      title: 'Gérer les conversations',
      content: 'Vous pouvez voir toutes vos conversations dans l\'onglet "Chat". Cliquez sur une conversation pour la continuer ou sur l\'icône de corbeille pour la supprimer.'
    },
    {
      title: 'À propos de MCP',
      content: 'MCP (Microservice Control Plane) est une plateforme qui permet d\'intégrer des modèles d\'IA avancés avec des bases de données personnelles tout en respectant la confidentialité des données.'
    }
  ];
}
