import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../survey.service';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';


registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    CommonModule,
    FormsModule,
  ],
})
export class CalendarComponent implements OnInit {
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

  modalPosition = { top: '0px', left: '0px' };

  constructor(
    private surveyService: SurveyService,
    private auth: AuthService,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.buildCalendar();
    this.loadReminders()  }

  /**
   * Convert UTC date to local time.
   */
  convertToLocalTime(utcDateString: string): string {
    const utcDate = new Date(utcDateString);
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16); // Return ISO format (yyyy-MM-ddTHH:mm)
  }

  /**
   * Open modal to add posology.
   */
  openAddPosologyModal(date: Date | null, event: MouseEvent): void {
    if (!date) {
      console.error('Date invalide ou absente.');
      return;
    }

    // Convertir la date UTC sélectionnée en heure locale française
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    this.posology.scheduledTime = localDate.toISOString().slice(0, 16); // Format yyyy-MM-ddTHH:mm
    this.showModal = true;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.modalPosition = {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX + rect.width}px`,
    };
  }


  /**
   * Close the posology modal.
   */
  closeModal(): void {
    this.showModal = false;
  }

  /**
   * Load reminders from the API.
   */
  loadReminders(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.surveyService.getAffichage(user.sub).subscribe({
          next: (reminders) => {
            console.log('Rappels chargés :', reminders);
            this.reminders = reminders;
            this.buildCalendar();
          },
          error: (err) => {
            console.error('Erreur lors du chargement des rappels :', err);
          },
        });
      } else {
        console.error('Utilisateur non authentifié.');
      }
    });
  }


  /**
   * Build calendar structure with reminders.
   */
   buildCalendar(): void {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
  
    const calendar = [];
    let week = [];
    let date = new Date(startOfMonth);
  
    // Ajouter les jours vides avant le début du mois
    while (date.getDay() !== 0) {
      week.push({ date: null, reminders: [] });
      date.setDate(date.getDate() - 1);
    }
  
    // Remplir le calendrier avec les jours du mois
    date = startOfMonth;
    while (date <= endOfMonth) {
      const dayReminders = this.reminders?.filter((reminder) =>
        new Date(reminder.posology.scheduledTime).toDateString() === date.toDateString()
      ) || [];
  
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  
      week.push({ date: localDate, reminders: dayReminders });
  
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
  
      date.setDate(date.getDate() + 1);
    }
  
    // Ajouter les jours vides après la fin du mois
    while (week.length < 7) {
      week.push({ date: null, reminders: [] });
    }
  
    if (week.length) {
      calendar.push(week);
    }
  
    this.calendar = calendar;
  }
  

  /**
   * Navigate to the previous month.
   */
  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  /**
   * Navigate to the next month.
   */
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  /**
   * Check if a date is today.
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  }

  /**
   * Confirm reminder as taken.
   */
  confirmReminder(reminderId: string): void {
    const payload = { action: 'confirm', reminderId };
    this.surveyService.handleNotificationResponse(payload).subscribe({
      next: () => {
        this.loadReminders();
        alert('Le rappel a été confirmé comme pris.');
      },
      error: (err) => {
        console.error('Erreur lors de la confirmation du rappel :', err);
      },
    });
  }

  /**
   * Save posology to the backend.
   */
  savePosology(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        const localDate = new Date(this.posology.scheduledTime); // Saisie locale
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000); // Convertir en UTC

        const payload = {
          userId: user.sub,
          medicationName: this.posology.medicationName,
          scheduledTime: utcDate.toISOString(), // Envoi au format UTC
        };

        this.surveyService.addPosology(payload).subscribe({
          next: () => {
            alert('Posologie enregistrée avec succès.');
            this.showModal = false;
            this.loadReminders();
          },
          error: (err) => console.error('Erreur lors de l\'enregistrement de la posologie :', err),
        });
      }
    });
  }

  /**
   * Reprogram a reminder.
   */
  remindLater(reminderId: string): void {
    const payload = { action: 'remind', reminderId };
    this.surveyService.handleNotificationResponse(payload).subscribe({
      next: () => {
        this.loadReminders();
        alert('Un rappel a été reprogrammé.');
      },
      error: (err) => {
        console.error('Erreur lors de la reprogrammation du rappel :', err);
      },
    });
  }

}
