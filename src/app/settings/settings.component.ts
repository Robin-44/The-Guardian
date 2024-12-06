import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { AuthService } from '@auth0/auth0-angular';
import { SurveyService } from '../../survey.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [CommonModule],
})
export class SettingsComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BFkqMe1Z27lVdZcX8yRf-1qPsS5YdCTBZblt6hn7-s4AOGFYNosXKFU1Z35jO_RhjNEVIm4NrAnrByq-tlD3Vsc';
  isSubscribed = false;
  notificationMessage: string | null = null;

  constructor(
    private swPush: SwPush,
    private surveyService: SurveyService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log('Service Worker actif:', navigator.serviceWorker.controller !== null);
    console.log('SwPush.isEnabled:', this.swPush.isEnabled);
    this.auth.user$.subscribe((user) => {
      if (user && this.swPush.isEnabled) {
        this.checkSubscription(user.sub);
      }
    });
  }

  // Vérifie si l'utilisateur est abonné
  checkSubscription(token: string): void {
    this.surveyService.getSubscriptionStatus(token).subscribe({
      next: (response) => {
        console.log('Statut de souscription reçu :', response);
        this.isSubscribed = response.isSubscribed;
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de souscription :', err);
      },
    });
  }
  

  // Souscrire aux notifications
  subscribeToNotifications(): void {
    if (!this.swPush.isEnabled) {
      this.notificationMessage = 'Les notifications ne sont pas supportées par votre navigateur.';
      return;
    }
  
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY,
        })
          .then((subscription) => {
            this.surveyService.saveSubscription({ token: user.sub, subscription }).subscribe({
              next: () => {
                this.isSubscribed = true;
                this.notificationMessage = 'Vous êtes maintenant abonné aux notifications.';
              },
              error: (err) => {
                console.error('Erreur lors de l\'enregistrement de la souscription :', err);
              },
            });
          })
          .catch((err) => {
            console.error('Erreur lors de la souscription :', err);
          });
      }
    });
  }
  

  // Désabonner des notifications
  unsubscribeFromNotifications(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.surveyService.removeSubscription(user.sub).subscribe({
          next: () => {
            this.isSubscribed = false;
            this.notificationMessage = 'Vous êtes maintenant désabonné des notifications.';
          },
          error: (err) => {
            console.error('Erreur lors de la désabonnement :', err);
          },
        });
      }
    });
  }
  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
