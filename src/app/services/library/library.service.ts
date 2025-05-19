import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export enum GameStatus {
  PLAYING = 'playing',
  PLAN_TO_PLAY = 'plan_to_play',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  ON_HOLD = 'on_hold'
}

@Injectable({
  providedIn: 'root'
})

export class LibraryService {
  private apiUrl = `${environment.apiUrl}/library`;

  addToLibrary(rawgId: number, status: GameStatus, notes: string | null = null, rating: number | null = null): Observable<any> {
    return from(
      axios.post(this.apiUrl, {
        rawg_id: rawgId,
        status,
        notes,
        rating
      }).then(response => response.data)
    );
  }
  
  getUserLibrary(): Observable<any[]> {
    return from(
      axios.get(this.apiUrl).then(response => response.data)
    );
  }

  getUserLibraryByUserId(userId: number): Observable<any[]> { // Parámetro renombrado y tipo de retorno ajustado
    return from(
      axios.get<any[]>(`${this.apiUrl}/${userId}`).then(response => response.data) // Usar userId y esperar any[]
    );
  }

  deleteFromLibrary(entryId: number): Observable<any> {
    console.log(`Eliminando juego con ID: ${entryId}`);
    return from(
      axios.delete(`${this.apiUrl}/${entryId}`)
        .then(response => {
          console.log('Respuesta del servidor:', response.data);
          return response.data;
        })
        .catch(error => {
          console.error('Error en la petición DELETE:', error);
          throw error;
        })
    );
  }
  
  // Nuevo método para actualizar una entrada existente
  updateLibraryEntry(entryId: number, status: GameStatus, notes: string | null = null, rating: number | null = null): Observable<any> {
    return from(
      axios.put(`${this.apiUrl}/${entryId}`, {
        status,
        notes,
        rating
      }).then(response => response.data)
    );
  }
}