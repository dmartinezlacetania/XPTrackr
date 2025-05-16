import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-cookie-consent',
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent {
  showBanner: boolean = false;

  ngOnInit() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      this.showBanner = true;
    }
  }

  acceptNecessary() {
    localStorage.setItem('cookieConsent', 'necessary');
    this.showBanner = false;
  }

  acceptAll() {
    localStorage.setItem('cookieConsent', 'all');
    this.showBanner = false;
    // Aquí puedes inicializar servicios de analytics si los agregas después
  }
}
