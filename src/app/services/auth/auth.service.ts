import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _apiUrl = 'http://localhost:8000';

  // Método específico para obtener la URL del avatar
  getAvatarUrl(avatarName: string): string {
    return `${this._apiUrl}/storage/avatars/${avatarName}`;
  } 
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();

  private user: any = null;

  async register(data: any) {
    await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
    const response = await axios.post(`${this._apiUrl}/api/register`, data);
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
      return null;
    }
  }

  async updateProfile(data: any) {
    try {
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
      const response = await axios.post(`${this._apiUrl}/api/update-profile`, data);
      
      if (response.data.user) {
        this.user = response.data.user;
      }
      
      // Si se actualizó la contraseña, forzamos un nuevo login
      if (data.new_password) {
        await this.login({
          email: data.email,
          password: data.new_password
        });
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
}
