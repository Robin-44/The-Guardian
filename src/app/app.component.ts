import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SwPush } from '@angular/service-worker';
import { SurveyService } from '../survey.service';
import { AuthService } from '@auth0/auth0-angular';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent ],
})
export class AppComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BFkqMe1Z27lVdZcX8yRf-1qPsS5YdCTBZblt6hn7-s4AOGFYNosXKFU1Z35jO_RhjNEVIm4NrAnrByq-tlD3Vsc';

  constructor(private swPush: SwPush, private surveyService: SurveyService,private auth: AuthService
    ) {}

  ngOnInit(): void {
    console.log('Service Worker actif:', navigator.serviceWorker.controller !== null);
    console.log('SwPush.isEnabled:', this.swPush.isEnabled);
  }
}
