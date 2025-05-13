// openai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, interval, of } from 'rxjs';
import { switchMap, catchError, map, takeWhile, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private baseUrl = 'https://api.openai.com/v1';
  private assistantId = 'asst_LdD9JYN5V2Es6TF9DM59tA09';
  private threadCache = new Map<string, string>(); // Pour réutiliser les threads

  constructor(private http: HttpClient) {}

  sendMessage(content: string, threadId?: string): Observable<any> {
    const apiKey = environment.openaiApiKey;
    if (!apiKey) {
      return throwError(() => new Error('API key not configured'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    });

    // Étape 1: Créer un thread ou réutiliser un existant
    const createOrReuseThread = threadId 
      ? of({ id: threadId }) 
      : this.http.post(`${this.baseUrl}/threads`, {}, { headers });

    return createOrReuseThread.pipe(
      switchMap((thread: any) => {
        const currentThreadId = thread.id;
        console.log(`Using thread: ${currentThreadId}`);

        // Étape 2: Ajouter le message de l'utilisateur au thread
        return this.http.post(`${this.baseUrl}/threads/${currentThreadId}/messages`, {
          role: 'user',
          content: content
        }, { headers }).pipe(
          switchMap((messageResponse) => {
            console.log('Message added:', messageResponse);
            
            // Étape 3: Exécuter l'assistant
            return this.http.post(`${this.baseUrl}/threads/${currentThreadId}/runs`, {
              assistant_id: this.assistantId
            }, { headers }).pipe(
              switchMap((run: any) => {
                const runId = run.id;
                console.log(`Run created: ${runId}`);

                // Étape 4: Attendre que l'exécution soit terminée
                return this.pollRunStatus(currentThreadId, runId, headers).pipe(
                  switchMap((completedRun) => {
                    console.log('Run completed:', completedRun);
                    
                    // Attendre 1 seconde pour s'assurer que tous les messages sont disponibles
                    return new Observable(observer => {
                      setTimeout(() => observer.next(true), 1000);
                    }).pipe(
                      switchMap(() => {
                        // Étape 5: Récupérer les messages avec pagination pour s'assurer d'avoir tous les messages
                        return this.getAllMessages(currentThreadId, headers);
                      })
                    );
                  }),
                  map((allMessages: any[]) => {
                    // Filtrer uniquement les messages de l'assistant
                    const assistantMessages = allMessages.filter(msg => msg.role === 'assistant');
                    
                    // Trier par created_at (timestamp numérique)
                    assistantMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    
                    console.log(`Found ${assistantMessages.length} assistant messages`);
                    
                    // Prendre uniquement le message le plus récent de l'assistant
                    const lastMessage = assistantMessages[0];
                    
                    if (!lastMessage) {
                      return { message: 'Aucune réponse reçue.', threadId: currentThreadId };
                    }
                    
                    // Extraire le contenu textuel
                    let content = '';
                    if (lastMessage.content && lastMessage.content.length > 0) {
                      for (const item of lastMessage.content) {
                        if (item.type === 'text') {
                          content += item.text.value;
                        }
                      }
                    }
                    
                    return { 
                      message: content.trim() || 'Réponse vide.', 
                      threadId: currentThreadId  // Retourner l'ID du thread pour réutilisation
                    };
                  }),
                  finalize(() => {
                    console.log('Request completed');
                  })
                );
              })
            );
          })
        );
      }),
      catchError(err => {
        console.error('OpenAI Assistant API error:', err);
        return throwError(() => new Error(err.message || 'Erreur inconnue côté serveur OpenAI'));
      })
    );
  }

  // Récupérer tous les messages avec pagination
  private getAllMessages(threadId: string, headers: HttpHeaders): Observable<any[]> {
    return new Observable(observer => {
      const fetchMessages = (after?: string, allMessages: any[] = []) => {
        let url = `${this.baseUrl}/threads/${threadId}/messages?limit=100`;
        if (after) {
          url += `&after=${after}`;
        }
        
        this.http.get(url, { headers }).subscribe({
          next: (response: any) => {
            const messages = response.data || [];
            const newAllMessages = [...allMessages, ...messages];
            
            if (response.has_more && response.data.length > 0) {
              // S'il y a plus de messages, récupérer la page suivante
              const lastId = response.data[response.data.length - 1].id;
              fetchMessages(lastId, newAllMessages);
            } else {
              // Tous les messages ont été récupérés
              observer.next(newAllMessages);
              observer.complete();
            }
          },
          error: (err) => {
            observer.error(err);
          }
        });
      };
      
      // Démarrer la récupération des messages
      fetchMessages();
    });
  }

  private pollRunStatus(threadId: string, runId: string, headers: HttpHeaders): Observable<any> {
    return new Observable(observer => {
      const checkStatus = () => {
        this.http.get(`${this.baseUrl}/threads/${threadId}/runs/${runId}`, { headers }).subscribe({
          next: (runStatus: any) => {
            console.log(`Run status: ${runStatus.status}`);
            
            if (runStatus.status === 'completed') {
              observer.next(runStatus);
              observer.complete();
            } else if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
              observer.error(new Error(`Run failed with status: ${runStatus.status}`));
            } else {
              // Continuer à vérifier toutes les secondes
              setTimeout(checkStatus, 1000);
            }
          },
          error: (err) => {
            observer.error(err);
          }
        });
      };
      
      // Démarrer la vérification du statut
      checkStatus();
    });
  }
}
