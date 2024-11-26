import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  private apiUrl = 'http://localhost:3000/api/add-user';  // URL de l'API en local

  constructor(private http: HttpClient) {}

  addUser(newUser: { userId: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, newUser); 
  }
  authUser(userId: string): Observable<{ surveyCompleted: number }> {
    return this.http.post<{ surveyCompleted: number }>(
      'http://localhost:3000/api/auth-user',
      { userId }
    );
  }


  // Vérifier le statut du formulaire
  checkSurvey(userId: string): Observable<{ surveyCompleted: boolean }> {
    return this.http.get<{ surveyCompleted: boolean }>(`${this.apiUrl}/survey-status/${userId}`);
  }

  // Soumettre le formulaire
  submitForm(surveyData: any): Observable<void> {
    return this.http.post<void>('http://localhost:3000/api/submit-survey', surveyData);
  }
  
}
