import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from '../../../services/games/games.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  gameId!: number;
  game: any = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gamesService: GamesService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
      this.loadGameDetails();
    });
  }

  loadGameDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.gamesService.getGameDetails(this.gameId).subscribe({
      next: (data) => {
        this.game = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles del juego:', err);
        this.error = 'No se pudieron cargar los detalles del juego. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}