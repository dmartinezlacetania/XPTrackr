// Importem les dependències necessàries
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import axios from 'axios';

// Configurem axios per gestionar les cookies i tokens CSRF
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Definim els possibles estats d'un joc a la biblioteca
export enum GameStatus {
  PLAYING = 'playing',
  PLAN_TO_PLAY = 'plan_to_play',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  ON_HOLD = 'on_hold'
}

// Definim el servei com injectable a nivell d'aplicació
@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  // URL base per les crides a l'API de la biblioteca
  private apiUrl = `${environment.apiUrl}/library`;

  // Mètode per afegir un joc a la biblioteca
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
  
  // Mètode per obtenir la biblioteca de l'usuari actual
  getUserLibrary(): Observable<any[]> {
    return from(
      axios.get(this.apiUrl).then(response => response.data)
    );
  }

  // Mètode per obtenir la biblioteca d'un usuari específic
  getUserLibraryByUserId(userId: number): Observable<any[]> {
    return from(
      axios.get<any[]>(`${this.apiUrl}/${userId}`).then(response => response.data)
    );
  }

  // Mètode per eliminar un joc de la biblioteca
  deleteFromLibrary(entryId: number): Observable<any> {
    return from(
      axios.delete(`${this.apiUrl}/${entryId}`)
        .then(response => {
          return response.data;
        })
        .catch(error => {
          throw error;
        })
    );
  }
  
  // Mètode per actualitzar una entrada de la biblioteca
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