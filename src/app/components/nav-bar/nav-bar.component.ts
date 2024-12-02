import { Component, Inject, OnInit } from '@angular/core';
import { faUser, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../../survey.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdown,
    NgbCollapse,
    AsyncPipe,
    NgIf,
    RouterLink,
  ],
})
export class NavBarComponent implements OnInit {
  isCollapsed = true; // Pour le menu collapsé
  faUser = faUser; // Icône utilisateur
  faPowerOff = faPowerOff; // Icône déconnexion
  user: any; // Stocke les informations utilisateur

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    // Souscrire à l'utilisateur authentifié
    this.auth.user$.subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          this.checkSurveyCompletion(user.sub);
        }
      },
      error: (err) => console.error('Erreur de récupération utilisateur:', err),
    });
  }

  // Vérifie si le sondage est complété
  private checkSurveyCompletion(userId: string): void {
    this.surveyService.authUser(userId).subscribe({
      next: (response) => {
        if (!response.surveyCompleted) {
          this.router.navigate(['/survey-form']);
        }
      },
      error: (err) =>
        console.error('Erreur lors de la vérification du sondage:', err),
    });
  }

  // Redirige vers la page de connexion
  loginWithRedirect(): void {
    this.auth.loginWithRedirect();
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
