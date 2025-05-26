// Importem els mòduls necessaris
import { Component } from '@angular/core';

// Definim el component del peu de pàgina
@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  // Propietats per mostrar l'any actual i el correu de contacte
  currentYear: number = new Date().getFullYear();
  mail = 'dmartinez@lacetania.cat';
}
