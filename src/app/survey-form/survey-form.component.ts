import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../survey.service';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class SurveyFormComponent implements OnInit {
  step = 1; 
  formData: any = {};
  userId: string | null = null; 
  userEmail: string | null = null; 
  progress = 0; 

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) this.userId = user.sub;
    });
  }

  submitForm(): void {
    if (!this.userId) return;

    const surveyData = { token: this.userId, ...this.formData };
    this.surveyService.submitForm(surveyData).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  // Affiche l'étape spécifiée
  displayStep(step: number) {
    this.step = step;
    this.updateProgress();
  }

  // Avance à l'étape suivante
  nextStep() {
    if (this.step < 4) {
      this.step++;
      this.updateProgress();
    }
  }

  // Revient à l'étape précédente
  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.updateProgress();
    }
  }

  // Mise à jour de la barre de progression
  updateProgress() {
    this.progress = (this.step - 1) * 50; // Chaque étape représente 50% de la progression
  }
  
}
