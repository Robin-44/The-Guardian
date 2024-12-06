import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

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
    const utcDate = new Date(data.scheduledTime).toISOString();
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

  getAffichage(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/affichage/user/${userId}`);
  }

  getSurveyResponses(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/survey-responses/${userId}`);
  }

  updateSurveyResponse(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/survey-response/${id}`, data);
  }

  deleteUserData(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-user-data`);
  }
  deletePosology(posologyId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/posologies/${posologyId}`);
  } 

}
