// Importem els components i mòduls necessaris
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from '../../../services/games/games.service';
import { LibraryService, GameStatus } from '../../../services/library/library.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';


// Definim el component de detalls del joc
@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})

export class GameDetailComponent implements OnInit {
  // Propietats per emmagatzemar la informació del joc i estats
  gameId!: number;
  game: any = null;
  isLoading: boolean = true;
  error: string | null = null;
  isAuthenticated = false;
  library: any[] = [];
  userLibraryEntry: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gamesService: GamesService,
    private libraryService: LibraryService,
    private authService: AuthService
  ) { }

  // Inicialitzem el component
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
      this.loadGameDetails();
      this.loadUserLibrary();
    });
    this.checkAuth();
  }

  // Comprovem l'estat d'autenticació
  async checkAuth() {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  // Carreguem la biblioteca de l'usuari
  loadUserLibrary(): void {
    this.libraryService.getUserLibrary().subscribe({
      next: (data) => {
        this.library = data;
        this.userLibraryEntry = this.library.find(entry => entry.rawg_id === this.gameId) || null;
      },
      error: (err) => {
        console.error('Error al carregar la biblioteca de l\'usuari:', err);
      }
    });
  }

  // Carreguem els detalls del joc
  loadGameDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.gamesService.getGameDetails(this.gameId).subscribe({
      next: (data) => {
        this.game = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al carregar els detalls del joc:', err);
        this.error = 'No s\'han pogut carregar els detalls del joc. Si us plau, intenta-ho de nou més tard.';
        this.isLoading = false;
      }
    });
  }

  // Tornem a la pàgina anterior
  goBack(): void {
    this.router.navigate(['/games']);
  }

  // Actualitzem l'estat del joc a la biblioteca
  updateGameStatus(status: GameStatus | null): void {
    if (!status) return;
    this.libraryService.addToLibrary(this.gameId, status).subscribe({
      next: () => {
        console.log('Joc afegit correctament');
      },
      error: (err) => {
        console.error('Error al afegir:', err);
        this.error = 'Error al desar el joc';
      }
    });
  }

  // Propietats i mètodes per gestionar el modal d'afegir/editar
  GameStatus = GameStatus;
  showAddModal = false;
  addStatus: GameStatus | null = null;
  addNotes: string | null = null;
  addRating: number | null = null;
  selectedStatus: GameStatus | null = null;
  

  // Obrim el modal d'afegir/editar
  openAddModal(): void {
    this.showAddModal = true;
    if (this.userLibraryEntry) {
      this.addStatus = this.userLibraryEntry.status;
      this.addNotes = this.userLibraryEntry.notes;
      this.addRating = this.userLibraryEntry.rating;
    } else {
      this.addStatus = null;
      this.addNotes = null;
      this.addRating = null;
    }
  }

  // Tanquem el modal
  closeAddModal(): void {
    this.showAddModal = false;
  }

  // Propietats per gestionar notificacions i confirmacions
  showNotification = false;
  notificationMessage = '';
  notificationTimeout: any = null;
  showDeleteConfirmation = false;

  // Afegim o actualitzem un joc a la biblioteca
  addToLibrary(): void {
    if (!this.addStatus) return;
    
    if (this.userLibraryEntry && this.userLibraryEntry.rawg_id) {
      this.libraryService.updateLibraryEntry(
        this.userLibraryEntry.rawg_id, 
        this.addStatus, 
        this.addNotes, 
        this.addRating
      ).subscribe({
        next: () => {
          this.closeAddModal();
          this.loadUserLibrary();
          this.showSuccessNotification('Juego actualizado correctamente');
        },
        error: (err) => {
          this.closeAddModal();
          this.error = 'Error al actualitzar el joc';
          console.error('Error al actualitzar:', err);
        }
      });
    } else {
      this.libraryService.addToLibrary(
        this.gameId, 
        this.addStatus, 
        this.addNotes, 
        this.addRating
      ).subscribe({
        next: () => {
          this.closeAddModal();
          this.loadUserLibrary();
          this.showSuccessNotification('Juego añadido a la biblioteca correctamente');
        },
        error: (err) => {
          this.closeAddModal();
          this.error = 'Error al guardar el juego';
          console.error('Error al desar:', err);
        }
      });
    }
  }

  // Mètodes per gestionar la confirmació d'eliminació
  openDeleteConfirmation(): void {
    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
  }

  // Eliminem un joc de la biblioteca
  deleteFromLibrary(): void {
    if (!this.userLibraryEntry || !this.userLibraryEntry.id) {
      console.error('No es pot eliminar: ID no disponible', this.userLibraryEntry);
      this.error = 'Error al eliminar: ID no disponible';
      return;
    }
    
    this.libraryService.deleteFromLibrary(this.userLibraryEntry.rawg_id).subscribe({
      next: (response) => {
        this.closeDeleteConfirmation();
        this.closeAddModal();
        this.userLibraryEntry = null;
        this.loadUserLibrary();
        this.showSuccessNotification('Juego eliminado correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.error = 'Error al eliminar el joc';
      }
    });
  }

  // Mètode per mostrar notificacions d'èxit
  showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
  }

  // Mètode per tancar la notificació
  closeNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  // Mètode per obtenir el text de l'estat en català
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
        return 'Desconocido';
    }
  }
}