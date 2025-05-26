import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// Configurem axios per gestionar les cookies i tokens CSRF
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Definim el servei com injectable a nivell d'aplicació
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de l'API
  private readonly _apiUrl = environment.apiUrl;

  // Mètode per obtenir la URL de l'avatar
  getAvatarUrl(avatarName: string): string {
    // Obtenim la URL base sense /api
    const baseUrl = this._apiUrl.replace('/api', '');
    return `${baseUrl}/avatars/${avatarName}`;
  } 

  // Observable per gestionar l'estat d'autenticació
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();

  // Emmagatzematge de l'usuari actual
  private user: any = null;

  // Mètode per registrar un nou usuari
  async register(data: any) {
    await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
    const response = await axios.post(`${this._apiUrl}/register`, data);
    this.authStatusSubject.next(true);
    this.user = response.data.user;
    return response;
  }

  // Mètode per iniciar sessió
  async login(data: any) {
    await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
    const response = await axios.post(`${this._apiUrl}/login`, data);
    this.authStatusSubject.next(true);
    this.user = await this.getUser();
    return response;
  }

  // Mètode per tancar sessió
  async logout() {
    const response = await axios.post(`${this._apiUrl}/logout`);
    this.authStatusSubject.next(false);
    this.user = null;
    return response;
  }

  // Mètode per obtenir les dades de l'usuari actual
  async getUser(forceReload = false) {
    // Si ja tenim l'usuari i no es força la recàrrega, el retornem
    if (this.user && !forceReload) {
      return this.user;
    }

    try {
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
      const response = await axios.get(`${this._apiUrl}/user`);
      this.user = response.data;
      console.log(this.user);
      this.authStatusSubject.next(true);
      return this.user;
    } catch (error) {
      // En cas d'error, netegem les dades de l'usuari
      this.user = null;
      this.authStatusSubject.next(false);
      return null;
    }
  }

  // Mètode per actualitzar el perfil de l'usuari
  async updateProfile(data: any) { 
    try { 
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`); 
      const response = await axios.post(`${this._apiUrl}/update-profile`, data); 
      
      // Actualitzem les dades de l'usuari si el servidor les retorna
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

  // Mètode per verificar si l'usuari està autenticat
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  // Mètode per actualitzar l'estat d'autenticació
  setAuthStatus(status: boolean) {
    this.authStatusSubject.next(status);
  }

  // Mètode per pujar un nou avatar
  async uploadAvatar(formData: FormData) {
    try {
      await axios.get(`${this._apiUrl}/sanctum/csrf-cookie`);
      const response = await axios.post(`${this._apiUrl}/update-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Actualitzem les dades de l'usuari si el servidor les retorna
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
