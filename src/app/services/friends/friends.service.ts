import { Injectable } from '@angular/core';
import axios from 'axios';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = environment.apiUrl;

  getFriends(): Observable<any> {
    return from(axios.get(`${this.apiUrl}/friends`).then(res => res.data));
  }

  searchUsers(search: string): Observable<any> {
    return from(axios.get(`${this.apiUrl}/users`, { params: { search } }).then(res => res.data));
  }

  sendRequest(friendId: number): Observable<any> {
    return from(axios.post(`${this.apiUrl}/friends`, { friend_id: friendId }).then(res => res.data));
  }

  acceptRequest(friendshipId: number): Observable<any> {
    return from(axios.post(`${this.apiUrl}/friends/${friendshipId}/accept`).then(res => res.data));
  }

  deleteFriend(friendshipId: number): Observable<any> {
    return from(axios.delete(`${this.apiUrl}/friends/${friendshipId}`).then(res => res.data));
  }

  getReceivedRequests(): Observable<any> {
    return from(axios.get(`${this.apiUrl}/friends/requests`).then(res => res.data));
  }

  getUserById(userId: number): Observable<any> {
    return from(axios.get(`${this.apiUrl}/user/${userId}`).then(res => res.data));
  }
}
