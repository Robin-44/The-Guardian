import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../survey.service';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Importation du CommonModule


@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class SurveyFormComponent implements OnInit {
  step = 1;  // Étape initiale
  formData: any = {};  // Données du formulaire
  userId: string | null = null;
  progress = 0;  // Progrès de la barre de progression

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    console.log('SurveyFormComponent chargé'); // Vérifiez dans la console

    // Récupérer l'utilisateur connecté
    this.auth.user$.subscribe((user) => {
      if (user && user.sub) {
        this.userId = user.sub;
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
    if (this.step < 3) {
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
    this.progress = (this.step - 1) * 50;  // Chaque étape représente 50% de la progression
  }

  submitForm() {
    if (this.userId) {
      const surveyData = {
        userId: this.userId,
        allergies: this.formData.allergies,
        exercise: this.formData.exercise,
        diet: this.formData.diet,
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
    } else {
      alert("Utilisateur non identifié : impossible de soumettre le formulaire.");
    }
  }
  
}
