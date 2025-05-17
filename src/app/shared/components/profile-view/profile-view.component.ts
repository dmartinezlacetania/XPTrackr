import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LibraryService, GameStatus } from '../../../services/library/library.service';
import { GamesService } from '../../../services/games/games.service';
import { FriendsService } from '../../../services/friends/friends.service';

interface UserStats {
  totalGames: number;
  completedGames: number;
  inProgressGames: number;
  pendingGames: number;
  abandonedGames: number;
}

interface LibraryEntry {
  rawg_id: number;
  status: GameStatus;
  rating: number | null;
  notes: string | null;
}

interface Game {
  id: number;
  name: string;
  background_image?: string;
  rating: number | null;
  playtime?: number;
  platforms?: Array<{ platform: { name: string } }>;
  status: GameStatus;
  notes?: string | null;
  rawg_rating?: number;
}

interface FilterOption {
  type: GameStatus | 'all';
  text: string;
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  public GameStatus = GameStatus;

  user: any = null;
  loading: boolean = true;
  avatarUrl: string = '/assets/images/default-avatar.png';
  private routeSubscription!: Subscription;
  private authSubscription!: Subscription;
  errorMessage: string = '';
  userStats: UserStats | null = null;
  userGames: Game[] = [];
  filteredGames: Game[] = [];
  selectedFilter: GameStatus | 'all' = 'all';

  paginatedGames: Game[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  public filterOptions: FilterOption[] = [
    {type: 'all', text: 'Todos'},
    {type: GameStatus.COMPLETED, text: 'Completados'},
    {type: GameStatus.PLAYING, text: 'Jugando'},
    {type: GameStatus.PLAN_TO_PLAY, text: 'Pendientes'},
    {type: GameStatus.DROPPED, text: 'Abandonados'}
  ];

  isViewingOwnProfile: boolean = true;
  private userIdFromRoute: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private libraryService: LibraryService,
    private gamesService: GamesService,
    private friendsService: FriendsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Obtener el userId de la ruta
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.userIdFromRoute = params.get('userId');
      console.log('ID de usuario en la ruta:', this.userIdFromRoute);
      
      // Verificar autenticación
      this.authService.isAuthenticated().then(isAuth => {
        console.log('Estado de autenticación:', isAuth);
        
        if (!isAuth) {
          console.log('No autenticado, redirigiendo a login');
          this.router.navigate(['/login']);
          this.loading = false;
          return;
        }
        
        // Si estamos autenticados, obtener el usuario actual
        this.authService.getUser()
          .then(loggedInUser => {
            console.log('Usuario logueado obtenido:', loggedInUser);
            
            if (!loggedInUser) {
              console.error('Usuario autenticado pero no se pudo obtener la información');
              this.errorMessage = 'Error al cargar la información del usuario';
              this.loading = false;
              return;
            }
            
            // Procesar según si estamos viendo nuestro perfil u otro
            if (this.userIdFromRoute) {
              console.log('Comparando IDs:', loggedInUser.id.toString(), this.userIdFromRoute);
              
              if (loggedInUser.id.toString() === this.userIdFromRoute) {
                // Es nuestro propio perfil
                console.log('Viendo perfil propio');
                this.isViewingOwnProfile = true;
                this.user = loggedInUser;
                this.updateAvatarUrl();
                this.loadUserLibrary();
              } else {
                // Es el perfil de otro usuario - Usar FriendsService.getUserById
                console.log('Viendo perfil de otro usuario, cargando datos...');
                this.isViewingOwnProfile = false;
                
                const userId = parseInt(this.userIdFromRoute, 10);
                if (isNaN(userId)) {
                  this.errorMessage = 'ID de usuario inválido';
                  this.loading = false;
                  return;
                }
                
                this.friendsService.getUserById(userId).subscribe({
                  next: (userData) => {
                    console.log('Datos de usuario obtenidos:', userData);
                    this.user = userData;
                    this.updateAvatarUrl();
                    this.loadUserLibrary(this.userIdFromRoute || undefined);
                  },
                  error: (error) => {
                    console.error('Error al cargar el perfil del usuario:', error);
                    this.errorMessage = 'No se pudo cargar el perfil del usuario';
                    this.loading = false;
                  }
                });
              }
            } else {
              // Sin userId en la ruta, mostramos nuestro propio perfil
              console.log('Sin userId en la ruta, mostrando perfil propio');
              this.isViewingOwnProfile = true;
              this.user = loggedInUser;
              this.updateAvatarUrl();
              this.loadUserLibrary();
            }
          })
          .catch(error => {
            console.error('Error al obtener el usuario:', error);
            this.errorMessage = 'Error al cargar el perfil';
            this.loading = false;
          });
      });
    });
  }
  
  updateAvatarUrl(): void {
    if (this.user && this.user.avatar) {
      this.avatarUrl = this.authService.getAvatarUrl(this.user.avatar);
    } else {
      this.avatarUrl = '/assets/images/default-avatar.png';
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  onImageError() {
    this.avatarUrl = '/assets/images/default-avatar.png';
  }

  loadUserLibrary(userIdToLoad?: string): void {
    console.log('Cargando biblioteca para usuario:', userIdToLoad || 'usuario actual');
    this.loading = true; 
    this.errorMessage = '';

    let libraryObservable;

    if (userIdToLoad) {
      const numericUserId = parseInt(userIdToLoad, 10);
      if (isNaN(numericUserId)) {
        console.error('ID de usuario inválido:', userIdToLoad);
        this.errorMessage = 'ID de usuario inválido.';
        this.userGames = [];
        this.filterGames(this.selectedFilter); 
        this.loading = false;
        return;
      }
      libraryObservable = this.libraryService.getUserLibraryByUserId(numericUserId);
    } else {
      libraryObservable = this.libraryService.getUserLibrary();
    }

    libraryObservable.pipe(
      switchMap(libraryEntries => {
        console.log('Entradas de biblioteca obtenidas:', libraryEntries);
        
        if (!libraryEntries || libraryEntries.length === 0) {
          console.log('No hay juegos en la biblioteca');
          return of([]);
        }
        
        // Obtener detalles de cada juego usando GamesService.getGameDetails
        const gameDetailsObservables = libraryEntries.map(entry => 
          this.gamesService.getGameDetails(entry.rawg_id).pipe(
            map(gameDetails => ({
              id: entry.rawg_id,
              name: gameDetails.name,
              background_image: gameDetails.background_image,
              rating: entry.rating, // Rating del usuario para este juego
              playtime: gameDetails.playtime,
              platforms: gameDetails.platforms,
              status: entry.status,
              notes: entry.notes,
              rawg_rating: gameDetails.rating // Rating general del juego
            })),
            catchError(error => {
              console.error(`Error al obtener detalles del juego ${entry.rawg_id}:`, error);
              // Devolver un objeto con datos mínimos en caso de error
              return of({
                id: entry.rawg_id,
                name: `Juego ${entry.rawg_id}`,
                background_image: '/assets/images/placeholder-game.jpg',
                rating: entry.rating,
                status: entry.status,
                notes: entry.notes
              });
            })
          )
        );
        
        return gameDetailsObservables.length > 0 
          ? forkJoin(gameDetailsObservables) 
          : of([]);
      })
    ).subscribe({
      next: (enrichedGames: Game[]) => {
        console.log('Juegos con detalles cargados:', enrichedGames);
        this.userGames = enrichedGames;
        this.filterGames(this.selectedFilter);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar la biblioteca:', error);
        this.errorMessage = 'No se pudo cargar la biblioteca de juegos.';
        this.userGames = [];
        this.filteredGames = [];
        this.filterGames(this.selectedFilter);
        this.loading = false;
      }
    });
  }

  filterGames(status: GameStatus | 'all'): void {
    console.log('Filtrando juegos por estado:', status);
    this.selectedFilter = status;
    this.filteredGames = status === 'all' 
      ? [...this.userGames] 
      : this.userGames.filter(game => game.status === status);
    this.calculateStats();
    this.currentPage = 1;
    this.updatePagination();
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
    
    console.log('Estadísticas calculadas:', this.userStats);
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
    
    console.log('Paginación actualizada:', {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      itemsPerPage: this.itemsPerPage,
      totalItems: this.filteredGames.length
    });
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

  navigateToGameDetail(gameId: number): void {
    if (gameId) {
      console.log('Navegando a detalles del juego:', gameId);
      this.router.navigate(['/games', gameId]);
    } else {
      console.error('No se puede navegar: gameId no está definido.');
    }
  }
}