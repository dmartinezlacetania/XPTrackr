// Importem les dependències necessàries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Definim el servei com injectable a nivell d'aplicació
@Injectable({
  providedIn: 'root'
})
export class GamesService {
  // URL base per les crides a l'API de jocs
  private apiUrl = `${environment.apiUrl}/games`;

  // Injectem el client HTTP per fer les peticions
  constructor(private http: HttpClient) { }

  // Mètode per cercar jocs segons un terme de cerca
  searchGames(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: {
        search: query,
        page_size: '5'
      }
    });
  }

  // Mètode per obtenir els detalls d'un joc específic
  getGameDetails(gameId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${gameId}`);
  }
}
