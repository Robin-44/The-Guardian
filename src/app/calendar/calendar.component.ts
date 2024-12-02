import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; // Module Angular de FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Vue par jour
import interactionPlugin from '@fullcalendar/interaction'; // Interaction (clics, drag & drop)
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [FullCalendarModule],
})
export class CalendarComponent implements OnInit {
  calendarOptions: any; // Options du calendrier

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    // Récupérer les événements depuis l'API
    this.http.get<any[]>('http://localhost:3000/api/calendar-events').subscribe(
      (events) => {
        this.calendarOptions = {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events, // Charger les événements récupérés
          eventColor: '#007bff', // Couleur des événements
          eventTextColor: 'white', // Couleur du texte
        };
      },
      (error) => {
        console.error('Erreur lors du chargement des événements :', error);
      }
    );
  }
}
