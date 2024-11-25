import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  private apiUrl = 'http://localhost:3000/api/add-user';  // URL de l'API en local

  constructor(private http: HttpClient) {}

  // Fonction pour ajouter un utilisateur
  addUser(newUser: { userId: string }): Observable<any> {
    return this.http.post(this.apiUrl, newUser);
  }

  // Vérifier le statut du formulaire
  checkSurvey(userId: string): Observable<{ surveyCompleted: boolean }> {
    return this.http.get<{ surveyCompleted: boolean }>(`${this.apiUrl}/survey-status/${userId}`);
  }

  // Soumettre le formulaire
  submitForm(formData: { userId: string; allergies: string; exercise: string; diet: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submit-form`, formData);
  }
}
