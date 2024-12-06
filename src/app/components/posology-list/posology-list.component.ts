import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../survey.service';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';  // Importation de FormsModule
import { Observable } from 'rxjs';


@Component({
  selector: 'app-posology-list',
  templateUrl: './posology-list.component.html',
  styleUrls: ['./posology-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],

})
export class PosologyListComponent implements OnInit {
  posologies: any[] = [];
  private baseUrl = 'http://localhost:3000/api';
  constructor(
    private surveyService: SurveyService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe({
      next: (user) => {
        if (user) {
          this.loadUserPosologies(user.sub);
        } else {
          console.error('Utilisateur non connecté.');
        }
      },
      error: (err) => console.error('Erreur lors de la récupération de l’utilisateur :', err),
    });
  }

  loadUserPosologies(userId: string): void {
    this.surveyService.getUserPosologies(userId).subscribe({
      next: (data) => {
        this.posologies = data;
        console.log('Posologies récupérées :', this.posologies);
      },
      error: (err) => console.error('Erreur lors du chargement des posologies :', err),
    });
  }

  downloadPDF(): void {
    const doc = new jsPDF();
  
    // Titre
    doc.text('Liste de vos Posologies', 14, 10);
  
    // Création des données pour la table
    const tableData = this.posologies.map((posology) => [
      posology.medicationName,
      new Date(posology.scheduledTime).toLocaleString(),
      posology.taken ? 'Oui' : 'Non',
    ]);
  
    // Ajout de la table
    (doc as any).autoTable({
      head: [['Médicament', 'Heure Programmée', 'Rappel Pris']],
      body: tableData,
    });
  
    // Télécharger le fichier PDF
    doc.save('posologies.pdf');
  }
  downloadExcel(): void {
    // Création des données pour Excel
    const worksheetData = [
      ['Médicament', 'Heure Programmée', 'Rappel Pris'],
      ...this.posologies.map((posology) => [
        posology.medicationName,
        new Date(posology.scheduledTime).toLocaleString(),
        posology.taken ? 'Oui' : 'Non',
      ]),
    ];
  
    // Créer une feuille de calcul
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Posologies');
  
    // Générer et télécharger le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'posologies.xlsx');
  }

  deletePosology(posologyId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette posologie ?')) {
      this.surveyService.deletePosology(posologyId).subscribe({
        next: () => {
          console.log('Posologie supprimée avec succès.');
          this.posologies = this.posologies.filter(
            (posology) => posology._id !== posologyId
          );
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la posologie :', err);
          alert('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
        },
      });
    }
  }
  
}
