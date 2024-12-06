import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SwPush } from '@angular/service-worker';
import { SurveyService } from '../survey.service';
import { AuthService } from '@auth0/auth0-angular';
import { routes } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent, RouterModule],
})
export class AppComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BFkqMe1Z27lVdZcX8yRf-1qPsS5YdCTBZblt6hn7-s4AOGFYNosXKFU1Z35jO_RhjNEVIm4NrAnrByq-tlD3Vsc';

  constructor(private swPush: SwPush, private router: Router) { }

  ngOnInit(): void {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message brut reçu depuis le service worker :', event.data);
  
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const rawData = event.data;
  
        // Extraction correcte des données
        const notification = rawData.data?.notification || {};
        const notificationData = notification.data || {};
  
        const reminderId = notificationData.reminderId;
        const action = notificationData.action;
  
        console.log('Payload extrait :', { reminderId, action });
  
        if (reminderId) {
          console.log('Redirection vers : /home-content avec reminderId =', reminderId);
          this.router.navigate(['/home-content'], { queryParams: { reminderId } });
        } else {
          console.error('Les données de la notification sont manquantes ou invalides.', notificationData);
        }
      }
    });
  }
  
  
}

