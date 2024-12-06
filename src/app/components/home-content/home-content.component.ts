import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SurveyService } from '../../../survey.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css'],
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule],
})
export class HomeContentComponent implements OnInit {
  currentMonth: Date = new Date();
  calendar: any[] = [];
  reminders: any[] = [];
  showModal: boolean = false;
  confirmationModalVisible: boolean = false;
  selectedReminderId: string | null = null;

  // Posology form data
  posology = {
    medicationName: '',
    scheduledTime: '',
  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private surveyService: SurveyService,
    private route: ActivatedRoute
  ) {}

  faLink = faLink;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const reminderId = params['reminderId'];
      if (reminderId) {
        this.loadReminder(reminderId); // Charge le rappel avec l'ID correct
        console.log('Rappel ID extrait des paramètres de la route :', reminderId);
      }
    });
  }
  

  /**
   * Charger les rappels depuis le backend
   */
   loadReminder(reminderId: string): void {
    this.surveyService.getReminders(reminderId).subscribe({
      next: (reminder) => {
        console.log('Rappel chargé :', reminder);
        this.selectedReminderId = reminderId;
        this.posology = {
          medicationName: reminder.posology.medicationName,
          scheduledTime: reminder.posology.scheduledTime,
        };
  
        // Ouvrir le modal
        const modalElement = document.getElementById('confirmationModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du rappel :', err);
      },
    });
  }
  

  // Navigation vers le calendrier
  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToPrescriptions(): void {
    this.router.navigate(['/posology-list']);
  }

  /**
   * Ouvrir le modal de confirmation pour un rappel spécifique
   */
  openConfirmationModal(reminderId: string): void {
    const reminder = this.reminders.find((r) => r._id === reminderId);
    if (reminder) {
      this.selectedReminderId = reminderId;
      this.posology = {
        medicationName: reminder.posology.medicationName,
        scheduledTime: reminder.posology.scheduledTime,
      };

      // Ouvrir le modal Bootstrap
      const modalElement = document.getElementById('confirmationModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    } else {
      console.error('Rappel non trouvé pour ID :', reminderId);
    }
  }

  closeConfirmationModal(): void {
    this.selectedReminderId = null;

    // Fermer le modal Bootstrap
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  confirmOrIgnoreReminder(action: 'confirm' | 'ignore'): void {
    if (!this.selectedReminderId) {
      console.error('Aucun reminderId sélectionné.');
      return;
    }
  
    this.surveyService.updateReminder(this.selectedReminderId, action).subscribe({
      next: () => {
        this.closeConfirmationModal();
        alert(action === 'confirm' ? 'Médicament confirmé.' : 'Rappel ignoré.');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du rappel :', err);
      },
    });
  }
  
}
