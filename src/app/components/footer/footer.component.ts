import { Component } from '@angular/core';
import { Router } from '@angular/router';  

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
})
export class FooterComponent {
  constructor(private router: Router) {}

  // Méthode pour naviguer vers les mentions légales
  goToMentions(): void {
    this.router.navigate(['/mentions-legales']);
  }
}
