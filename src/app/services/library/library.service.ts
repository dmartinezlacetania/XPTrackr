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
  private apiUrl = `${environment.apiUrl}/api/library`;

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
}