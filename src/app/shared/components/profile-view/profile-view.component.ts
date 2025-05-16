import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router'; // Asegúrate de que Router está importado
import { Subscription, forkJoin, of } from 'rxjs'; // Importar forkJoin y of
import { map, switchMap, catchError } from 'rxjs/operators'; // Importar operadores de RxJS
import { LibraryService, GameStatus } from '../../../services/library/library.service';
import { GamesService } from '../../../services/games/games.service'; // Importar GamesService

interface UserStats {
  totalGames: number;
  completedGames: number;
  inProgressGames: number;
  pendingGames: number;
  abandonedGames: number;
}

// Interfaz para la entrada de la biblioteca tal como la devuelve LibraryService
interface LibraryEntry {
  rawg_id: number;
  status: GameStatus;
  rating: number | null;
  notes: string | null;
  // Asegúrate de que esta interfaz coincida con lo que devuelve tu backend para /api/library
}

// Interfaz Game actualizada para incluir 'notes' y reflejar datos combinados
interface Game {
  id: number; // rawg_id
  name: string;
  background_image?: string;
  rating: number | null; // Este será el rating personal del usuario para el juego en su biblioteca
  playtime?: number; // Podría ser el playtime promedio de RAWG
  platforms?: Array<{ platform: { name: string } }>;
  status: GameStatus;
  notes?: string | null; // Notas del usuario para este juego en su biblioteca
  // Puedes añadir más campos de los detalles del juego si los necesitas
  rawg_rating?: number; // Rating general del juego en RAWG, si quieres mostrar ambos
}

// Interfaz para las opciones de filtro para mayor claridad y seguridad de tipo
interface FilterOption {
  type: GameStatus | 'all';
  text: string;
}

@Component({
  selector: 'app-profile-view',
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  public GameStatus = GameStatus; // Ya lo tenías, es correcto

  user: any = null;
  loading: boolean = true;
  avatarUrl: string = '/images/default-avatar.png';
  private authSubscription!: Subscription;
  errorMessage: string = '';
  userStats: UserStats | null = null;
  userGames: Game[] = [];
  filteredGames: Game[] = [];
  selectedFilter: GameStatus | 'all' = 'all';

  // Propiedades para la paginación
  paginatedGames: Game[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6; // Coincide con el *ngIf="filteredGames.length > 6" (implica 6 por página)
  totalPages: number = 0;

  public filterOptions: FilterOption[] = [
    {type: 'all', text: 'Todos'},
    {type: GameStatus.COMPLETED, text: 'Completados'},
    {type: GameStatus.PLAYING, text: 'Jugando'},
    {type: GameStatus.PLAN_TO_PLAY, text: 'Pendientes'},
    {type: GameStatus.DROPPED, text: 'Abandonados'}
    // Si GameStatus.ON_HOLD también debe ser un filtro, añádelo aquí:
    // {type: GameStatus.ON_HOLD, text: 'En Pausa'}
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private libraryService: LibraryService,
    private gamesService: GamesService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authStatus$.subscribe(async isAuth => {
      this.loading = true;

      if (isAuth) {
        try {
          const user = await this.authService.getUser();
          if (user) {
            this.user = user;
            if (this.user.avatar) {
              this.avatarUrl = this.authService.getAvatarUrl(this.user.avatar);
            }
            this.loadUserLibrary(); 
            
          } else {
            this.router.navigate(['/login']);
          }
        } catch {
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
      // this.loading = false; // Se maneja en loadUserLibrary
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadUserStats(): void {
    this.userStats = {
      totalGames: this.userGames.length, // Usar userGames que ahora tiene los datos completos
      completedGames: this.userGames.filter(g => g.status === GameStatus.COMPLETED).length,
      inProgressGames: this.userGames.filter(g => g.status === GameStatus.PLAYING).length,
      pendingGames: this.userGames.filter(g => g.status === GameStatus.PLAN_TO_PLAY).length,
      abandonedGames: this.userGames.filter(g => g.status === GameStatus.DROPPED).length
    };
  }

  onImageError() {
    this.avatarUrl = '/images/default-avatar.png';
  }

  loadUserLibrary(): void {
    this.loading = true;
    this.libraryService.getUserLibrary().pipe(
      switchMap((libraryEntries: LibraryEntry[]) => {
        if (!libraryEntries || libraryEntries.length === 0) {
          return of([]); // Devuelve un observable de un array vacío si no hay juegos
        }
        // Crear un array de observables, cada uno obteniendo detalles de un juego
        const gameDetailObservables = libraryEntries.map(entry =>
          this.gamesService.getGameDetails(entry.rawg_id).pipe(
            map(gameDetails => ({
              // Combinar detalles del juego con la información de la biblioteca
              id: entry.rawg_id,
              name: gameDetails.name,
              background_image: gameDetails.background_image,
              rating: entry.rating, // Rating personal del usuario
              playtime: gameDetails.playtime, // Playtime promedio de RAWG
              platforms: gameDetails.platforms,
              status: entry.status,
              notes: entry.notes,
              rawg_rating: gameDetails.rating // Rating general de RAWG
            })),
            catchError(error => {
              console.error(`Error fetching details for game ${entry.rawg_id}:`, error);
              // Devolver un objeto parcial o nulo para que forkJoin no falle completamente
              // O podrías filtrar estos errores más tarde
              return of(null); 
            })
          )
        );
        return forkJoin(gameDetailObservables);
      }),
      map(detailedGames => detailedGames.filter(game => game !== null) as Game[]) // Filtrar los que fallaron
    ).subscribe({
      next: (enrichedGames: Game[]) => {
        console.log('Enriched library loaded:', enrichedGames);
        this.userGames = enrichedGames;
        // Aplicar filtro inicial (o 'all') y luego paginar
        this.filterGames(this.selectedFilter); 
        // this.calculateStats(); // calculateStats es llamado por filterGames
        // this.updatePagination(); // updatePagination es llamado por filterGames
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user library:', error);
        this.userGames = [];
        this.filteredGames = [];
        this.calculateStats(); // Recalcular con biblioteca vacía
        this.loading = false; // Finalizar carga incluso con error
      }
    });
  }

  filterGames(status: GameStatus | 'all'): void {
    this.selectedFilter = status;
    this.filteredGames = status === 'all' 
      ? [...this.userGames] 
      : this.userGames.filter(game => game.status === status);
    this.calculateStats();
    this.currentPage = 1; // Resetear a la primera página con cada filtro
    this.updatePagination(); // Actualizar paginación después de filtrar
  }

  calculateStats(): void {
    const gamesForStats = this.userGames; 

    this.userStats = {
      totalGames: gamesForStats.length,
      completedGames: gamesForStats.filter(g => g.status === GameStatus.COMPLETED).length,
      inProgressGames: gamesForStats.filter(g => g.status === GameStatus.PLAYING).length,
      pendingGames: gamesForStats.filter(g => g.status === GameStatus.PLAN_TO_PLAY).length,
      abandonedGames: gamesForStats.filter(g => g.status === GameStatus.DROPPED).length
    };
  }

  updatePagination(): void {
    if (!this.filteredGames) {
      this.paginatedGames = [];
      this.totalPages = 0;
      return;
    }
    this.totalPages = Math.ceil(this.filteredGames.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedGames = this.filteredGames.slice(startIndex, endIndex);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Helper para generar un array de números de página para el HTML
  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  getStatusText(status: GameStatus): string {
    const statusMap = {
      [GameStatus.PLAYING]: 'Jugando',
      [GameStatus.COMPLETED]: 'Completado',
      [GameStatus.PLAN_TO_PLAY]: 'Pendiente',
      [GameStatus.DROPPED]: 'Abandonado',
      [GameStatus.ON_HOLD]: 'En pausa'
    };
    return statusMap[status] || 'Desconocido';
  }

  // Nuevo método para navegar al detalle del juego
  navigateToGameDetail(gameId: number): void {
    if (gameId) {
      this.router.navigate(['/games', gameId]); // Asume que tu ruta es /games/:id
    } else {
      console.error('No se puede navegar: gameId no está definido.');
    }
  }
}