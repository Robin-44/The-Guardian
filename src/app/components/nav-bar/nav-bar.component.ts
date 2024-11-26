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

 
  
  addUser(userEmail: string) {
    const newUser = { userId: userEmail };
  
    this.surveyService.authUser(newUser.userId).subscribe(
      (response) => {
        console.log('Réponse du backend :', response);
  
        // Redirection en fonction de survey_completed
        if (response.surveyCompleted === 0) {
          console.log('Redirection vers le formulaire de santé');
          this.router.navigate(['/survey-form']);
        } else {
          console.log('Redirection vers le tableau de bord');
          this.router.navigate(['/dashboard']);
        }
      },
      (error) => {
        console.error('Erreur lors de la gestion de l\'authentification :', error);
      }
    );
  }

  ngOnInit(): void {
    // Vérifiez si l'utilisateur est authentifié
    this.auth.user$.subscribe((user) => {
      if (user) {
        const userEmail = user.email; // Récupérer l'email de l'utilisateur
        console.log('Email utilisateur:', userEmail);
  
        // Appel pour ajouter l'utilisateur et rediriger en fonction du statut
        this.addUser(userEmail);
      }
    });
  }
  

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
