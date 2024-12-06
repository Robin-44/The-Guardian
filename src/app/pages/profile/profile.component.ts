import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SurveyService } from '../../../survey.service';
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    CommonModule,
    FormsModule,
  ],
  standalone: true,
})
export class ProfileComponent implements OnInit {
  surveyResponses: any[] = [];
  selectedResponse: any = null;

  // Ajouter la propriété user
  user: any = null;

  constructor(private auth: AuthService, private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.auth.user$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user; // Stocker les données utilisateur dans la propriété user
          console.log('Utilisateur connecté :', this.user);
          this.loadSurveyResponses(user.sub); // Utilise `sub` comme identifiant utilisateur
        } else {
          console.error('Utilisateur non connecté.');
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
      },
    });
  }

  // Charger les réponses de l'utilisateur
  loadSurveyResponses(userId: string): void {
    this.surveyService.getSurveyResponses(userId).subscribe({
      next: (data) => {
        this.surveyResponses = data;
        console.log('Réponses récupérées :', this.surveyResponses);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des réponses :', err);
      },
    });
  }

  // Méthodes pour gérer l'édition, la sauvegarde, etc.
  editResponse(response: any): void {
    response.isEditing = true;
  }

  cancelEdit(response: any): void {
    response.isEditing = false;
    this.loadSurveyResponses(response.user);
  }

  saveResponse(response: any): void {
    this.surveyService.updateSurveyResponse(response._id, response).subscribe({
      next: (updatedResponse) => {
        console.log('Réponse mise à jour :', updatedResponse);
        response.isEditing = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la réponse :', err);
      },
    });
  }

  deleteUserData(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.')) {
      this.surveyService.deleteUserData().subscribe({
        next: () => {
          alert('Vos données ont été supprimées avec succès. Vous allez être déconnecté.');
          this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression des données :', err);
          alert('Une erreur est survenue lors de la suppression des données. Veuillez réessayer.');
        },
      });
    }
  }
}
