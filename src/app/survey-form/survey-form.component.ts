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
  step = 1; // Étape initiale
  formData: any = {}; // Données du formulaire
  userId: string | null = null; // Pour le token (user.sub)
  userEmail: string | null = null; // Pour l'email (user.email)
  progress = 0; // Progrès de la barre de progression

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    console.log('SurveyFormComponent chargé');

    // Récupérer les informations de l'utilisateur connecté
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.userId = user.sub; // Stocke le token (Auth0 user ID)
        this.userEmail = user.email; // Stocke l'email
        console.log('Utilisateur connecté :', user);
      } else {
        this.router.navigate(['/login']);
      }
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

  submitForm() {
    if (!this.userId || !this.userEmail || !this.formData.userName || !this.formData.medicationName) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
  
    const surveyData = {
      userId: this.userEmail,
      token: this.userId,
      userName: this.formData.userName,
      userAge: this.formData.userAge || null,
      userGender: this.formData.userGender,
      medicationName: this.formData.medicationName,
      medicationDosage: this.formData.medicationDosage,
      medicationForm: this.formData.medicationForm,
      frequency: this.formData.frequency,
      medicationDate: this.formData.medicationDate || null,
      reminderTime: this.formData.reminderTime,
    };
  
    this.surveyService.submitForm(surveyData).subscribe(
      () => {
        alert('Formulaire soumis avec succès !');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Erreur lors de la soumission :', error);
        alert('Erreur lors de la soumission des données.');
      }
    );
  }
  
}
