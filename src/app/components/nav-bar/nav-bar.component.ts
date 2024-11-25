import { Component, Inject } from '@angular/core';
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
export class NavBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    // Vérifiez si l'utilisateur est authentifié et récupérez son email
    this.auth.user$.subscribe(user => {
      if (user) {
        const userEmail = user.email;  // Récupérer l'email de l'utilisateur
        console.log('Email utilisateur:', userEmail);

        // Appel pour ajouter l'utilisateur dans la base de données
        this.addUser(userEmail);
      }
    });
  }

  addUser(userEmail: string) {
    // Créez un objet avec l'email de l'utilisateur à envoyer à l'API
    const newUser = { userId: userEmail };

    // Appel au service pour ajouter l'utilisateur dans la base de données
    this.surveyService.addUser(newUser).subscribe(
      (response) => {
        console.log('Utilisateur ajouté avec succès');
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      }
    );
  }

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
