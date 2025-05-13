import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from '../../../services/games/games.service';
import { LibraryService, GameStatus } from '../../../services/library/library.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- AÑADE FormsModule AQUÍ
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})

export class GameDetailComponent implements OnInit {
  gameId!: number;
  game: any = null;
  isLoading: boolean = true;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gamesService: GamesService,
    private libraryService: LibraryService,
    private authService: AuthService // <--- Añade esto
  ) { }



  library: any[] = [];
  userLibraryEntry: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
      this.loadGameDetails();
      this.loadUserLibrary();
    });
    this.checkAuth();
  }

  async checkAuth() {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  loadUserLibrary(): void {
    this.libraryService.getUserLibrary().subscribe({
      next: (data) => {
        this.library = data;
        this.userLibraryEntry = this.library.find(entry => entry.rawg_id === this.gameId) || null;
      },
      error: (err) => {
        console.error('Error al cargar la biblioteca del usuario:', err);
      }
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

  updateGameStatus(status: GameStatus | null): void {
    if (!status) return;
    console.log(`Status updated to: ${status}`);
    this.libraryService.addToLibrary(this.gameId, status).subscribe({
      next: () => {
        console.log('Juego añadido correctamente');
      },
      error: (err) => {
        console.error('Error al añadir:', err);
        this.error = 'Error al guardar el juego';
      }
    });
  }
  GameStatus = GameStatus;
  showAddModal = false;
  addStatus: GameStatus | null = null;
  addNotes: string | null = null;
  addRating: number | null = null;

  selectedStatus: GameStatus | null = null;

  openAddModal(): void {
    this.showAddModal = true;
    if (this.userLibraryEntry) {
      // Si ya existe, precarga los datos para editar
      this.addStatus = this.userLibraryEntry.status;
      this.addNotes = this.userLibraryEntry.notes;
      this.addRating = this.userLibraryEntry.rating;
    } else {
      this.addStatus = null;
      this.addNotes = null;
      this.addRating = null;
    }
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addToLibrary(): void {
    if (!this.addStatus) return;
    this.libraryService.addToLibrary(this.gameId, this.addStatus, this.addNotes, this.addRating).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadUserLibrary(); // Refresca el estado tras guardar
      },
      error: (err) => {
        this.closeAddModal();
        this.error = 'Error al guardar el juego';
        console.error('Error al guardar:', err);
      }
    });
  }


  getStatusText(status: GameStatus): string {
    switch (status) {
      case GameStatus.PLAYING:
        return 'Jugando';
      case GameStatus.PLAN_TO_PLAY:
        return 'Pendiente';
      case GameStatus.COMPLETED:
        return 'Completado';
      case GameStatus.DROPPED:
        return 'Abandonado';
      case GameStatus.ON_HOLD:
        return 'En pausa';
      default:
        return '';
    }
  }
}