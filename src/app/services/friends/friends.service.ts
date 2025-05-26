// Importem les dependències necessàries
import { Injectable } from '@angular/core';
import axios from 'axios';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Configurem axios per gestionar les cookies i tokens CSRF
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Definim el servei com injectable a nivell d'aplicació
@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  // URL base per les crides a l'API
  private apiUrl = environment.apiUrl;

  // Mètode per obtenir la llista d'amics
  getFriends(): Observable<any> {
    return from(axios.get(`${this.apiUrl}/friends`).then(res => res.data));
  }

  // Mètode per cercar usuaris
  searchUsers(search: string): Observable<any> {
    return from(axios.get(`${this.apiUrl}/users`, { params: { search } }).then(res => res.data));
  }

  // Mètode per enviar una sol·licitud d'amistat
  sendRequest(friendId: number): Observable<any> {
    return from(axios.post(`${this.apiUrl}/friends`, { friend_id: friendId }).then(res => res.data));
  }

  // Mètode per acceptar una sol·licitud d'amistat
  acceptRequest(friendshipId: number): Observable<any> {
    return from(axios.post(`${this.apiUrl}/friends/${friendshipId}/accept`).then(res => res.data));
  }

  // Mètode per eliminar un amic
  deleteFriend(friendshipId: number): Observable<any> {
    return from(axios.delete(`${this.apiUrl}/friends/${friendshipId}`).then(res => res.data));
  }

  // Mètode per obtenir les sol·licituds d'amistat rebudes
  getReceivedRequests(): Observable<any> {
    return from(axios.get(`${this.apiUrl}/friends/requests`).then(res => res.data));
  }

  // Mètode per obtenir un usuari pel seu ID
  getUserById(userId: number): Observable<any> {
    return from(axios.get(`${this.apiUrl}/user/${userId}`).then(res => res.data));
  }
}
