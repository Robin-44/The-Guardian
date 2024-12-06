import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.auth.user$.subscribe((user) => {
      if (user && user.name) {
        this.userName = user.name;
      }
    });
  }

  // Navigation vers le calendrier
  goToCalendar(): void {
    this.router.navigate(['/calendar']);
  }
  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

}
