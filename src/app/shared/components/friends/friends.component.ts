import { Component, OnInit } from '@angular/core';
import { FriendsService } from '../../../services/friends/friends.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service'; // Asegúrate de que tienes un servicio de autenticación
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-friends',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  friends: any[] = [];
  searchResults: any[] = [];
  searchQuery: string = '';
  error: string | null = null;
  receivedRequests: any[] = []; // NUEVA PROPIEDAD

  constructor(private friendsService: FriendsService, private authService: AuthService) { }


  ngOnInit(): void {
    this.loadFriends();
    this.loadReceivedRequests(); // NUEVA LLAMADA
  }

  async loadFriends() {
    const currentUser = await this.authService.getUser();
    const myId = currentUser?.id;
    this.friends = [];
    this.friendsService.getFriends().subscribe({
      next: (data) => {
        data.forEach((friendship: any) => {
          const friendId = friendship.user_id === myId ? friendship.friend_id : friendship.user_id;
          this.friendsService.getUserById(friendId).subscribe(user => {
            this.friends.push(user);
          });
        });
        // console.log(this.friends);
      },
      error: () => this.error = 'Error al cargar amigos'
    });
  }

  loadReceivedRequests() {
    this.receivedRequests = [];
    this.friendsService.getReceivedRequests().subscribe({
      next: (data) => {
        data.forEach((receivedFriendRequest: any) => {
          const friendId = receivedFriendRequest.user_id;
          this.friendsService.getUserById(friendId).subscribe(user => {
            this.receivedRequests.push(user);
          });
        });
        // console.log(this.receivedRequests);
      },
      error: () => this.error = 'Error al cargar solicitudes recibidas'
    });
  }

  searchUsers() {
    if (!this.searchQuery) return;
    this.friendsService.searchUsers(this.searchQuery).subscribe({
      next: (data) => this.searchResults = data,
      error: () => this.error = 'Error al buscar usuarios'
    });
  }

  sendRequest(userId: number) {
    this.friendsService.sendRequest(userId).subscribe({
      next: () => this.searchUsers(),
      error: () => this.error = 'Error al enviar solicitud'
    });
  }

  acceptRequest(friendshipId: number) {
    this.friendsService.acceptRequest(friendshipId).subscribe({
      next: () => {
        this.loadFriends();
        this.loadReceivedRequests(); // Actualiza solicitudes tras aceptar
      },
      error: () => this.error = 'Error al aceptar solicitud'
    });
  }

  deleteFriend(friendshipId: number) {
    this.friendsService.deleteFriend(friendshipId).subscribe({
      next: () => this.loadFriends(),
      error: () => this.error = 'Error al eliminar amigo'
    });
  }
}
