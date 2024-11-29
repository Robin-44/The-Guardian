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

  testNotification(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/test-notification`, { token });
  }
  
  
}
