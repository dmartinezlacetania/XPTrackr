import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private apiUrl = `${environment.apiUrl}/api/games`;

  constructor(private http: HttpClient) { }

  searchGames(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: {
        search: query,
        page_size: '5'
      }
    });
  }

  getGameDetails(gameId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${gameId}`);
  }
}
