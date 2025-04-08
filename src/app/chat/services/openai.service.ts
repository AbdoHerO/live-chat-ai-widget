// src/app/chat/services/openai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  sendMessage(messages: any[]): Observable<any> {
    // Use environment variable for API key
    const apiKey = environment.openaiApiKey;
    
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return throwError(() => new Error('API key is not configured'));
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const body = {
      model: 'gpt-3.5-turbo', // Using a more affordable model
      messages: messages,
      max_tokens: 500
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      catchError(error => {
        console.error('Error calling OpenAI API:', error);
        return throwError(() => new Error(`Failed to get response from AI: ${error.message}`));
      })
    );
  }
}
