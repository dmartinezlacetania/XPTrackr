import { Component, OnInit } from '@angular/core';
import { FriendsService } from '../../../services/friends/friends.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  friends: any[] = [];
  searchResults: any[] = [];
  searchQuery: string = '';
  error: string | null = null;
  receivedRequests: any[] = [];
  
  // Estados de carga
  loadingFriends: boolean = true;
  loadingRequests: boolean = true;
  isSearching: boolean = false;

  constructor(private friendsService: FriendsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadFriends();
    this.loadReceivedRequests();
  }

  async loadFriends() {
    this.loadingFriends = true;
    const currentUser = await this.authService.getUser();
    const myId = currentUser?.id;
    this.friends = [];
    
    this.friendsService.getFriends().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadingFriends = false;
          return;
        }
        let loadedCount = 0;
        data.forEach((friendship: any) => {
          const friendId = friendship.user_id === myId ? friendship.friend_id : friendship.user_id;
          this.friendsService.getUserById(friendId).subscribe({
            next: user => {
              this.friends.push({
                ...user,
                friendshipId: friendship.id,
                avatarUrl: user.avatar ? this.authService.getAvatarUrl(user.avatar) : null
              });
              loadedCount++;
              if (loadedCount === data.length) {
                this.loadingFriends = false;
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === data.length) {
                this.loadingFriends = false;
              }
            }
          });
        });
      },
      error: () => {
        this.error = 'Error al cargar amigos';
        this.loadingFriends = false;
      }
    });
  }

  loadReceivedRequests() {
    this.loadingRequests = true;
    this.receivedRequests = [];
    
    this.friendsService.getReceivedRequests().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadingRequests = false;
          return;
        }
        let loadedCount = 0;
        data.forEach((receivedFriendRequest: any) => {
          const friendId = receivedFriendRequest.user_id;
          this.friendsService.getUserById(friendId).subscribe({
            next: user => {
              this.receivedRequests.push({
                ...user,
                requestId: receivedFriendRequest.id,
                avatarUrl: user.avatar ? this.authService.getAvatarUrl(user.avatar) : null
              });
              loadedCount++;
              if (loadedCount === data.length) {
                this.loadingRequests = false;
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === data.length) {
                this.loadingRequests = false;
              }
            }
          });
        });
      },
      error: () => {
        this.error = 'Error al cargar solicitudes recibidas';
        this.loadingRequests = false;
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }
    this.isSearching = true;
    this.friendsService.searchUsers(this.searchQuery).subscribe({
      next: (data) => {
        this.searchResults = data.map((user: any) => ({
          ...user,
          avatarUrl: user.avatar ? this.authService.getAvatarUrl(user.avatar) : null
        }));
        this.isSearching = false;
      },
      error: () => {
        this.error = 'Error al buscar usuarios';
        this.isSearching = false;
      }
    });
  }

  sendRequest(userId: number) {
    this.friendsService.sendRequest(userId).subscribe({
      next: () => {
        // Mostrar algún tipo de notificación de éxito
        this.searchUsers();
      },
      error: () => this.error = 'Error al enviar solicitud'
    });
  }

  acceptRequest(requestId: number) {
    this.friendsService.acceptRequest(requestId).subscribe({
      next: () => {
        // Mostrar algún tipo de notificación de éxito
        this.loadFriends();
        this.loadReceivedRequests();
      },
      error: () => this.error = 'Error al aceptar solicitud'
    });
  }

  deleteFriend(friendshipId: number) {
    this.friendsService.deleteFriend(friendshipId).subscribe({
      next: () => {
        // Mostrar algún tipo de notificación de éxito
        this.loadFriends();
      },
      error: () => this.error = 'Error al eliminar amigo'
    });
  }

  // Método para rechazar solicitudes (si lo necesitas)
  rejectRequest(requestId: number) {
    // Si tienes un método en el servicio para rechazar solicitudes, úsalo aquí
    // Si no, puedes usar el método deleteFriend si funciona para rechazar solicitudes también
    this.friendsService.deleteFriend(requestId).subscribe({
      next: () => {
        // Mostrar algún tipo de notificación de éxito
        this.loadReceivedRequests();
      },
      error: () => this.error = 'Error al rechazar solicitud'
    });
  }
}