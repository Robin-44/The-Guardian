import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ExternalApiComponent } from './pages/external-api/external-api.component';
import { ErrorComponent } from './pages/error/error.component';
import { authGuardFn } from '@auth0/auth0-angular';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SurveyFormComponent } from './survey-form/survey-form.component';
import { CalendarComponent } from './calendar/calendar.component';
import { SettingsComponent } from './settings/settings.component';
import { MentionsLegalesComponent } from './mentions-legales/mentions-legales.component';
import { HomeContentComponent } from './components/home-content/home-content.component'; 
import { PosologyListComponent } from './components/posology-list/posology-list.component';


export const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'external-api',
    component: ExternalApiComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'survey-form',
    component: SurveyFormComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [authGuardFn],
  },

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuardFn]
  },


  {
    path: 'mentions-legales',
    component: MentionsLegalesComponent,
  },

  {
    path: 'home-content',
    component: HomeContentComponent,
  },

  {
    path: 'posology-list',
    component: PosologyListComponent,
  }
  

];
