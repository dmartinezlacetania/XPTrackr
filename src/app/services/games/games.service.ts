import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private apiUrl = 'https://api.rawg.io/api';
  private apiKey = '9aec84ffef7d443e911dacc052cfbb79'; // Necesitarás registrarte en RAWG para obtener una API key

  constructor(private http: HttpClient) { }

  searchGames(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/games`, {
      params: {
        key: this.apiKey,
        search: query,
        page_size: 5 // Limitamos a 5 resultados para la búsqueda rápida
      }
    }).pipe(
      map((response: any) => response.results)
    );
  }

  getGameDetails(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}`, {
      params: {
        key: this.apiKey
      }
    });
  }
}
