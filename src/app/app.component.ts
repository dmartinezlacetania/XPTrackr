// Importem els components i mòduls necessaris
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from './shared/components/footer/footer.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { AuthService } from './services/auth/auth.service';

// Definim el component principal de l'aplicació
@Component({
  selector: 'app-root',
  imports: [NavbarComponent, FooterComponent, CookieConsentComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Títol de l'aplicació
  title = 'XPTrackr';

  constructor(private authService: AuthService) {}

  // Inicialitzem el component i restaurem la sessió si existeix
  ngOnInit() {
    this.authService.getUser(); // Restaurem la sessió si la cookie segueix vàlida
  }
}
