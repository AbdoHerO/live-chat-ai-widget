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
      name: 'Statistiques de Ventes',
      questions: [
        'Quels sont les produits les plus vendus ce mois-ci ?',
        'Quelle est l’évolution des ventes cette année ?',
        'Quels mois enregistrent les ventes les plus fortes ?'
      ]
    },
    {
      name: 'Suivi des Achats',
      questions: [
        'Quels produits ont été achetés en grande quantité cette année ?',
        'Quels fournisseurs ont été les plus sollicités ?',
        'Quelle est la tendance des achats par trimestre ?'
      ]
    },
    {
      name: 'État des Stocks',
      questions: [
        'Quels sont les produits en rupture de stock ?',
        'Quels produits ont un niveau de stock critique ?',
        'Quels articles doivent être réapprovisionnés en priorité ?'
      ]
    }
  ];
  
  selectQuestion(question: string) {
    this.selectHelp.emit(question);
  }
}
