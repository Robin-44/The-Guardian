import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [RouterModule], 
  templateUrl: './mentions-legales.component.html',
  styleUrls: ['./mentions-legales.component.css'] 
})
export class MentionsLegalesComponent {
  constructor(private router: Router) {}

  goToProfile(): void {
    this.router.navigate(['/profile']); 
  }
}
