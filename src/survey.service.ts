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
}
