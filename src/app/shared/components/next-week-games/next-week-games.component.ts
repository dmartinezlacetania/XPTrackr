import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../../services/games/games.service'; // Ajusta la ruta si es necesario
import { RouterModule } from '@angular/router'; // Para enlaces a detalles del juego

@Component({
  selector: 'app-next-week-games',
  standalone: true,
  imports: [CommonModule, RouterModule], // Asegúrate de que RouterModule esté aquí si usas [routerLink]
  templateUrl: './next-week-games.component.html',
  styleUrls: ['./next-week-games.component.css']
})
export class NextWeekGamesComponent implements OnInit {
  games: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.gamesService.getNextWeekGames().subscribe({
      next: (response) => {
        // La API de RAWG devuelve los juegos en la propiedad 'results'
        this.games = response.results || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching next week games:', err);
        this.errorMessage = 'No se pudieron cargar los juegos de la próxima semana.';
        this.isLoading = false;
      }
    });
  }
}
