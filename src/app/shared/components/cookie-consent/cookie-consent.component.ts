// Importem els mòduls necessaris
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// Definim el component de consentiment de cookies
@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent {
  // Estat per mostrar o amagar el banner
  showBanner: boolean = false;

  // Inicialitzem el component i comprovem si ja hi ha consentiment
  ngOnInit() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      this.showBanner = true;
    }
  }

  // Mètode per acceptar només les cookies necessàries
  acceptNecessary() {
    localStorage.setItem('cookieConsent', 'necessary');
    this.showBanner = false;
  }

  // Mètode per acceptar totes les cookies
  acceptAll() {
    localStorage.setItem('cookieConsent', 'all');
    this.showBanner = false;
    // Aquí es poden inicialitzar serveis d'analítica si s'afegeixen després
  }
}
