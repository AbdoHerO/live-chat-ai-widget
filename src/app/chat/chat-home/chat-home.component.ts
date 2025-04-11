// src/app/chat/components/chat-home.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-chat-home',
  templateUrl: './chat-home.component.html',
  styleUrls: ['./chat-home.component.scss']
})
export class ChatHomeComponent implements OnInit {
  @Output() askQuestion = new EventEmitter<string>();
  @Output() selectArticle = new EventEmitter<string>();
  @Output() navigateToHelpTab = new EventEmitter<void>();

  featuredArticles = [
    {
      id: 'article1',
      title: 'Premier médicament marocain à base de cannabis',
      subtitle: 'Innovation',
      description: 'Le 19/12/2024',
      content: 'Après avoir lancé, en 2015, le SSB 400, premier générique pour traiter l\'hépatite C, Pharma 5 s\'attaque à l\'épilepsie ...',
      image: 'https://cdn.officielpharma.ma/de4b0f80-4bd1-462f-8cea-9db2f798759e_cannabis.jpg',
      url: 'https://www.officielpharma.ma/actuList'
    },
    {
      id: 'article2',
      title: 'OFFICINE PLUS 2024',
      subtitle: 'Événement',
      description: 'Le 05/06/2024',
      content: '14ème Edition du Salon Officine Plus 2024 qui se déroulera les 29 Juin 2024 à l\'hôtel BARCEL Casablanca ...',
      image: 'https://cdn.officielpharma.ma/3e7dce79-6a95-47f0-8112-e878fd2ec8ee_Officine%20plus%202024.PNG',
      url: 'https://www.officielpharma.ma/actuList'
    },
    {
      id: 'article3',
      title: 'Suspension des AMM et retrait des lots contenant de la PHOLCODINE',
      subtitle: 'Alerte sanitaire',
      description: 'Le 28/03/2023',
      content: 'Conformément aux recommandations de la Commission Nationale de Pharmacovigilance, il a été décidé la suspension des Autorisations ...',
      image: 'https://cdn.officielpharma.ma/fe98abab-bb9f-44f1-8a59-72faa96349da_LOGO%20minist%C3%83%C2%A8re%20de%20la%20sant%C3%83%C2%A9.png',
      url: 'https://www.officielpharma.ma/actuList'
    }
  ];

  suggestedQuestions = [
    { text: 'Quels sont les médicaments les plus vendus ce mois-ci ?' },
    { text: 'Quels produits ont été les plus achetés cette année ?' },
    { text: 'Quels sont les produits actuellement en rupture de stock ?' },
    { text: 'Quels produits nécessitent un réapprovisionnement urgent ?' }
  ];

  constructor() { }

  ngOnInit(): void { }

  onAskQuestion(): void {
    this.askQuestion.emit();
  }

  onSelectArticle(id: string): void {
    const article = this.featuredArticles.find(a => a.id === id);
    if (article && article.url) {
      window.open(article.url, '_blank');
    } else {
      this.selectArticle.emit(id);
    }
  }

  onSelectQuestion(text: string): void {
    this.askQuestion.emit(text);
  }
}
