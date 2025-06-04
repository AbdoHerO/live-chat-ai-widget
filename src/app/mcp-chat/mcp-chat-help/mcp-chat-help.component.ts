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
      title: 'Accéder à vos données personnelles',
      content: 'Pour consulter vos informations personnelles, posez une question spécifique comme "Quel est mon solde actuel ?" et choisissez l\'option 1 (Base de données internes) quand l\'assistant vous le demande.'
    },
    {
      title: 'Questions sur vos données personnelles',
      content: 'Vous pouvez demander des informations sur votre solde, vos transactions récentes, votre numéro client, vos échéances de paiement, et d\'autres données personnelles stockées dans la base interne.'
    },
    {
      title: 'Utiliser les connaissances générales',
      content: 'Pour des questions générales qui ne concernent pas vos données personnelles, choisissez l\'option 2 (Connaissances générales) quand l\'assistant vous le demande.'
    },
    {
      title: 'Exemples de questions personnelles',
      content: '"Quel est mon solde actuel ?", "Quand est ma prochaine échéance ?", "Quelles sont mes dernières transactions ?", "Quel est mon numéro client ?", "Quelle est mon adresse enregistrée ?"'
    },
    {
      title: 'Confidentialité des données',
      content: 'Vos données personnelles sont sécurisées dans la base interne et ne sont jamais partagées avec des tiers. L\'assistant n\'y accède que lorsque vous choisissez explicitement l\'option 1.'
    },
    {
      title: 'À propos de Base interne',
      content: 'Base interne est une plateforme qui permet d\'intégrer des modèles d\'IA avancés avec des bases de données personnelles tout en respectant la confidentialité des données.'
    }
  ];
}
