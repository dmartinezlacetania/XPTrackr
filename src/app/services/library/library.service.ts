// Importem les dependències necessàries
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import axios from 'axios';

// Configurem axios per gestionar les cookies i tokens CSRF
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Definim el servei com injectable a nivell d'aplicació
@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  // URL base per les crides a l'API de la biblioteca
  private apiUrl = `${environment.apiUrl}/library`;

  // Mètode per afegir un joc a la biblioteca de l'usuari
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
  
  // Mètode per obtenir la biblioteca de l'usuari
  getUserLibrary(): Observable<any[]> {
    return from(
      axios.get(this.apiUrl).then(response => response.data)
    );
  }
}
export enum GameStatus {
  PLAYING = 'playing',
  PLAN_TO_PLAY = 'plan_to_play',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  ON_HOLD = 'on_hold'
}