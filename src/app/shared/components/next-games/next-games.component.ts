import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../../services/games/games.service';
import { RouterModule } from '@angular/router';

interface Game {
  id: number;
  name: string;
  background_image?: string;
  released?: string;
  platforms?: Array<{ platform: { name: string } }>;
  library_status?: 'playing' | 'completed' | 'plan_to_play' | 'on_hold' | 'dropped';
}

@Component({
  selector: 'app-next-week-games',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './next-games.component.html',
  styleUrls: ['./next-games.component.css']
})
export class NextGamesComponent implements OnInit {
  games: Game[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Propiedades del carrusel
  currentIndex: number = 0;
  slidesToShow: number = 4; // Por defecto en pantallas grandes
  autoplayInterval: any;
  touchStartX: number = 0;
  touchEndX: number = 0;

  constructor(private gamesService: GamesService) {
    this.updateSlidesToShow();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.gamesService.getNextWeekGames().subscribe({
      next: (response: { results: Game[] }) => {
        this.games = response.results.map(game => ({
          ...game,
          platforms: game.platforms?.map(p => ({ 
            platform: { 
              name: p.platform?.name || 'Desconocida' 
            } 
          })) || []
        }));
        console.log('Juegos de la próxima semana:', this.games);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching next week games:', err);
        this.errorMessage = 'No se pudieron cargar los juegos de la próxima semana.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  // Actualizar el número de slides a mostrar según el tamaño de la pantalla
  @HostListener('window:resize')
  updateSlidesToShow(): void {
    if (window.innerWidth < 640) {
      this.slidesToShow = 1; // Móvil
    } else if (window.innerWidth < 768) {
      this.slidesToShow = 2; // Tablet pequeña
    } else if (window.innerWidth < 1024) {
      this.slidesToShow = 3; // Tablet grande
    } else {
      this.slidesToShow = 4; // Desktop
    }
    
    // Asegurarse de que el índice actual sea válido después de cambiar slidesToShow
    if (this.games.length > 0) {
      this.currentIndex = Math.min(this.currentIndex, this.games.length - this.slidesToShow);
      if (this.currentIndex < 0) this.currentIndex = 0;
    }
  }

  // Navegación del carrusel
  nextSlide(): void {
    if (this.currentIndex < this.games.length - this.slidesToShow) {
      this.currentIndex++;
      this.resetAutoplay();
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetAutoplay();
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index <= this.games.length - this.slidesToShow) {
      this.currentIndex = index;
      this.resetAutoplay();
    }
  }

  // Autoplay
  startAutoplay(): void {
    if (this.games.length > this.slidesToShow) {
      this.autoplayInterval = setInterval(() => {
        if (this.currentIndex >= this.games.length - this.slidesToShow) {
          this.currentIndex = 0;
        } else {
          this.currentIndex++;
        }
      }, 5000); // Cambiar cada 5 segundos
    }
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  // Soporte para gestos táctiles
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  handleSwipe(): void {
    const swipeThreshold = 50; // Umbral mínimo para considerar un swipe
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    if (swipeDistance > swipeThreshold) {
      // Swipe derecha -> ir a la izquierda
      this.prevSlide();
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe izquierda -> ir a la derecha
      this.nextSlide();
    }
  }

  isValidDate(dateString: string): boolean {
    return !isNaN(Date.parse(dateString));
  }
}


