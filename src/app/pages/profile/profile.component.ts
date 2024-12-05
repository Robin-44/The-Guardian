import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HighlightModule } from 'ngx-highlightjs';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [HighlightModule, AsyncPipe, NgIf],
})
export class ProfileComponent implements OnInit {
  formData = {
    userName: 'Jean',
    userAge: 25,
    userGender: 'Homme',
    userWeight: 75,
    userSize: 180,
    userBloodType: 'O+',
    userComments: 'Aucun'
  };

  // Ouvrir la modale de modification
  openEditModal() {
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
  }

  // Sauvegarder les changements effectués
  saveChanges() {
    // Effectuer les sauvegardes ou validations nécessaires ici
    // Fermer la modale après la sauvegarde
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.hide(); // Utilisation de la méthode hide() pour fermer la modale
  }

  // Ouvrir la modale de suppression
  openDeleteModal() {
    const editModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    editModal.show();
  }

  // Supprimer les données utilisateur
  deleteData() {
    // Effectuer les sauvegardes ou validations nécessaires ici
    // Fermer la modale après la sauvegarde
    const editModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    editModal.hide(); // Utilisation de la méthode hide() pour fermer la modale
  }
  profileJson: string = null;

  constructor(public auth: AuthService) { }

  ngOnInit() {
    this.auth.user$.subscribe(
      (profile) => (this.profileJson = JSON.stringify(profile, null, 2))
    );
  }
}