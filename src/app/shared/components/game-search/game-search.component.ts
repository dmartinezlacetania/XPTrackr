import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.css']
})
export class GameSearchComponent {
  @Input() showResults = false;
  @Output() closeResults = new EventEmitter<void>();
  
  searchTerm = '';
  searchResults: any[] = [];
  isLoading = false;
  errorMessage = '';
  private searchTerms = new Subject<string>();
  
  // URL de la API desde el entorno
  private apiUrl = `${environment.apiUrl}/api/games`;

  constructor(private http: HttpClient, private router: Router) {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) {
          this.searchResults = [];
          return of([]);
        }
        
        this.isLoading = true;
        return this.searchGames(term).pipe(
          catchError(error => {
            this.errorMessage = 'Error al buscar juegos. Inténtalo de nuevo.';
            console.error('Error en la búsqueda:', error);
            return of([]);
          })
        );
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.isLoading = false;
    });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  close(): void {
    this.closeResults.emit();
  }

  private searchGames(query: string) {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: {
        search: query,
        page_size: '5'
      }
    }).pipe(
      switchMap(response => {
        if (response && response.results) {
          return of(response.results);
        } else if (response) {
          return of(response);
        }
        return of([]);
      }),
      catchError(error => {
        this.errorMessage = 'Error al conectar con el servidor. Inténtalo de nuevo más tarde.';
        console.error('Error en la búsqueda:', error);
        return of([]);
      })
    );
  }

  viewGameDetails(gameId: number): void {
    this.router.navigate(['/games', gameId]);
    this.close(); // Cerramos el buscador
  }
}
