import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _apiUrl = environment.apiUrl;

  // Método específico para obtener la URL del avatar
  getAvatarUrl(avatarName: string): string {
    return `${this._apiUrl}/avatars/${avatarName}`;
  } 
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();

  private user: any = null;

  async register(data: any) {
    await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
    const response = await axios.post(`${this._apiUrl}/register`, data);
    this.authStatusSubject.next(true);
    this.user = response.data.user; // Si el backend lo devuelve
    return response;
  }

  async login(data: any) {
    await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
    const response = await axios.post(`${this._apiUrl}/login`, data);
    this.authStatusSubject.next(true);
    this.user = await this.getUser(); // Carga el usuario tras login
    return response;
  }

  async logout() {
    const response = await axios.post(`${this._apiUrl}/logout`);
    this.authStatusSubject.next(false);
    this.user = null;
    return response;
  }

  async getUser(forceReload = false) {
    if (this.user && !forceReload) {
      return this.user;
    }

    try {
      const response = await axios.get(`${this._apiUrl}/api/user`);
      this.user = response.data;
      console.log(this.user);
      this.authStatusSubject.next(true);
      return this.user;
    } catch (error) {
      this.user = null;
      this.authStatusSubject.next(false);
      return null; // Devuelve null en caso de error (ej. no autenticado)
    }
  }

  async updateProfile(data: any) { 
    try { 
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`); 
      const response = await axios.post(`${this._apiUrl}/api/update-profile`, data); 
      
      if (response.data.user) { 
        this.user = response.data.user; 
        this.authStatusSubject.next(true);
      } else { 
        await this.getUser(true); 
      }
      
      return response; 
    } catch (error) { 
      throw error; 
    } 
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  setAuthStatus(status: boolean) {
    this.authStatusSubject.next(status);
  }

  async uploadAvatar(formData: FormData) {
    try {
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
      const response = await axios.post(`${this._apiUrl}/api/update-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Actualiza el usuario local si el backend devuelve el usuario actualizado
      if (response.data.user) {
        this.user = response.data.user;
        this.authStatusSubject.next(true);
      } else {
        await this.getUser(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  
}
