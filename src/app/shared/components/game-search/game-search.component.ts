import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';

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
  
  // Reemplaza esto con tu API key de RAWG
  private apiKey = '9aec84ffef7d443e911dacc052cfbb79';
  private apiUrl = 'https://api.rawg.io/api/games';

  constructor(private http: HttpClient) {
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
        key: this.apiKey,
        search: query,
        page_size: '5'
      }
    }).pipe(
      switchMap(response => {
        if (response && response.results) {
          return of(response.results);
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
}
