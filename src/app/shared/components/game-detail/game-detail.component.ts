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
        console.log('Entrada de biblioteca encontrada:', this.userLibraryEntry);
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

  // Añadir estas propiedades para la notificación
  showNotification = false;
  notificationMessage = '';
  notificationTimeout: any = null;
  showDeleteConfirmation = false; // Nueva propiedad para el modal de confirmación

  addToLibrary(): void {
    if (!this.addStatus) return;
    
    // Si ya existe una entrada, actualizarla en lugar de crear una nueva
    if (this.userLibraryEntry && this.userLibraryEntry.rawg_id) {
      this.libraryService.updateLibraryEntry(
        this.userLibraryEntry.rawg_id, 
        this.addStatus, 
        this.addNotes, 
        this.addRating
      ).subscribe({
        next: () => {
          this.closeAddModal();
          this.loadUserLibrary(); // Refresca el estado tras actualizar
          this.showSuccessNotification('Juego actualizado en tu biblioteca correctamente');
        },
        error: (err) => {
          this.closeAddModal();
          this.error = 'Error al actualizar el juego';
          console.error('Error al actualizar:', err);
        }
      });
    } else {
      // Si no existe, crear una nueva entrada
      this.libraryService.addToLibrary(
        this.gameId, 
        this.addStatus, 
        this.addNotes, 
        this.addRating
      ).subscribe({
        next: () => {
          this.closeAddModal();
          this.loadUserLibrary(); // Refresca el estado tras guardar
          this.showSuccessNotification('Juego añadido a tu biblioteca correctamente');
        },
        error: (err) => {
          this.closeAddModal();
          this.error = 'Error al guardar el juego';
          console.error('Error al guardar:', err);
        }
      });
    }
  }

  // Método para mostrar el modal de confirmación de eliminación
  openDeleteConfirmation(): void {
    this.showDeleteConfirmation = true;
  }

  // Método para cerrar el modal de confirmación
  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
  }

  // Método para eliminar el juego de la biblioteca
  // Método para eliminar el juego de la biblioteca
  deleteFromLibrary(): void {
    if (!this.userLibraryEntry || !this.userLibraryEntry.id) {
      console.error('No se puede eliminar: ID no disponible', this.userLibraryEntry);
      this.error = 'Error al eliminar: ID no disponible';
      return;
    }
    
    console.log('Intentando eliminar juego con ID:', this.userLibraryEntry.rawg_id);
    
    this.libraryService.deleteFromLibrary(this.userLibraryEntry.rawg_id).subscribe({
      next: (response) => {
        console.log('Juego eliminado correctamente:', response);
        this.closeDeleteConfirmation();
        this.closeAddModal();
        this.userLibraryEntry = null; // Eliminar la referencia local
        this.loadUserLibrary(); // Recargar la biblioteca
        this.showSuccessNotification('Juego eliminado de tu biblioteca correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar el juego:', err);
        this.closeDeleteConfirmation();
        this.error = 'Error al eliminar el juego de la biblioteca';
      }
    });
  }

  // Método para mostrar la notificación de éxito
  showSuccessNotification(message: string): void {
    // Limpiar cualquier timeout existente
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    this.notificationMessage = message;
    this.showNotification = true;
    
    // Ocultar la notificación después de 3 segundos
    this.notificationTimeout = setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  // Método para cerrar la notificación manualmente
  closeNotification(): void {
    this.showNotification = false;
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
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