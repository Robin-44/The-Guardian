import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  authUser(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth-user`, { token });
  }

  submitForm(surveyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/submit-survey`, surveyData);
  }

  saveSubscription(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscribe`, data);
  }

  removeSubscription(token: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/unsubscribe/${token}`);
  }

  getSubscriptionStatus(token: string): Observable<{ isSubscribed: boolean }> {
    return this.http.get<{ isSubscribed: boolean }>(`${this.baseUrl}/subscription-status/${token}`);
  }

    addPosology(data: any): Observable<any> {
      const utcDate = new Date(data.scheduledTime).toISOString(); // Convertir en UTC
      const payload = { ...data, scheduledTime: utcDate };
      return this.http.post(`${this.baseUrl}/posology`, payload);
    }
  

  handleNotificationResponse(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notification-response`, data);
  }

  remindLater(reminderId: string): Observable<any> {
    const payload = { reminderId, action: 'remind' };
    return this.http.post(`${this.baseUrl}/notification-response`, payload);
  }
  
  getReminders(reminderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reminder/${reminderId}`);
  } 
  
  updateReminder(reminderId: string, action: 'confirm' | 'ignore'): Observable<any> {
    return this.http.post(`${this.baseUrl}/reminder/${reminderId}/action`, { action });
  }
  
  getUserPosologies(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user-posologies/${userId}`);
  }  
  deletePosology(posologyId: string): Observable<any> {
    return this.http.delete(`/api/posologies/${posologyId}`);
  }  
  updatePosology(posology: any): Observable<any> {
    return this.http.put(`/api/posologies/${posology._id}`, posology); // Envoyer les données de la posologie mises à jour
  }    
}
