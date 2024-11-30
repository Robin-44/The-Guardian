import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../survey.service';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';


registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    CommonModule, 
    FormsModule
  ],
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  calendar: any[] = []; 
  reminders: any[] = []; 

  showModal: boolean = false; 
  posology = {
    medicationName: '',
    scheduledTime: '', 
  };
  modalPosition = { top: '0px', left: '0px' };

  openAddPosologyModal(date: Date | null, event: MouseEvent): void {
    if (!date) {
      console.error('Date invalide ou absente.');
      return;
    }
    this.posology.scheduledTime = date.toISOString().slice(0, 16); // Pré-remplir la date-heure
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.modalPosition = {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX + rect.width}px`,
    };
    this.showModal = true;
  }
  
  
  closeModal(): void {
    this.showModal = false;
  }

  constructor(
    private surveyService: SurveyService,
    private auth: AuthService 
  ) {}

  ngOnInit(): void {
    this.loadReminders();
  }

  // Charger les rappels depuis l'API
  loadReminders(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.surveyService.getReminders(user.sub).subscribe({
          next: (reminders) => {
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

  // Construire la vue du calendrier
  buildCalendar(): void {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const calendar = [];
    let week = [];
    let date = new Date(startOfMonth);

    // Remplir les jours avant le début du mois
    while (date.getDay() !== 0) {
      week.push({ date: null, reminders: [] });
      date.setDate(date.getDate() - 1);
    }

    date = startOfMonth;

    // Remplir les jours du mois
    while (date <= endOfMonth) {
      const dayReminders = this.reminders.filter((reminder) =>
        new Date(reminder.scheduledTime).toDateString() === date.toDateString()
      );

      week.push({ date: new Date(date), reminders: dayReminders });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }

      date.setDate(date.getDate() + 1);
    }

    // Remplir les jours après la fin du mois
    while (week.length < 7) {
      week.push({ date: null, reminders: [] });
    }
    if (week.length) {
      calendar.push(week);
    }

    this.calendar = calendar;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  // Vérifier si une date est aujourd'hui
  isToday(date: Date): boolean {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  }

  // Confirmer un rappel
  confirmReminder(reminderId: string): void {
    const payload = { action: 'confirm', reminderId };
    this.surveyService.handleNotificationResponse(payload).subscribe({
      next: () => {
        this.loadReminders(); // Recharger les rappels
        alert('Le rappel a été confirmé comme pris.');
      },
      error: (err) => {
        console.error('Erreur lors de la confirmation du rappel :', err);
      },
    });
  }


  savePosology(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        const payload = {
          ...this.posology,
          userId: user.sub, // Ajouter l'utilisateur connecté
        };

        this.surveyService.addPosology(payload).subscribe({
          next: () => {
            alert('Posologie enregistrée avec succès.');
            this.showModal = false;
            this.loadReminders(); // Recharger les rappels
          },
          error: (err) => console.error('Erreur lors de l\'enregistrement de la posologie :', err),
        });
      } else {
        console.error('Utilisateur non authentifié.');
      }
    });
  }

  remindLater(reminderId: string): void {
    const payload = { action: 'remind', reminderId };
    this.surveyService.handleNotificationResponse(payload).subscribe({
      next: () => {
        this.loadReminders(); // Recharger les rappels
        alert('Un rappel a été reprogrammé.');
      },
      error: (err) => {
        console.error('Erreur lors de la reprogrammation du rappel :', err);
      },
    });
  }
  
}
