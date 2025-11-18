import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SplashPage implements OnInit {

  showButtons = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.delay(2000);
    this.checkUser();
  }

  checkUser() {
    const user = this.authService.getCurrentUser();

    if (user) {
      if (user.rol === 'asesor_comercial') {
        this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });
      } else {
        this.router.navigate(['/tabs'], { replaceUrl: true });
      }
    } else {
      this.showButtons = true;
    }
  }

  explorarInvitado() {
    this.router.navigate(['/tabs'], { replaceUrl: true });
  }

  goLogin() {
    this.router.navigate(['/pages/auth/login'], { replaceUrl: true });
  }

  goRegister() {
    this.router.navigate(['/pages/auth/register'], { replaceUrl: true });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
