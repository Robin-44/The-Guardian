import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../survey.service';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-posology-list',
  templateUrl: './posology-list.component.html',
  styleUrls: ['./posology-list.component.css'],
  standalone: true,
  imports: [CommonModule],

})
export class PosologyListComponent implements OnInit {
  posologies: any[] = [];

  constructor(
    private surveyService: SurveyService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe({
      next: (user) => {
        if (user) {
          this.loadUserPosologies(user.sub);
        } else {
          console.error('Utilisateur non connecté.');
        }
      },
      error: (err) => console.error('Erreur lors de la récupération de l’utilisateur :', err),
    });
  }

  loadUserPosologies(userId: string): void {
    this.surveyService.getUserPosologies(userId).subscribe({
      next: (data) => {
        this.posologies = data;
        console.log('Posologies récupérées :', this.posologies);
      },
      error: (err) => console.error('Erreur lors du chargement des posologies :', err),
    });
  }
}
