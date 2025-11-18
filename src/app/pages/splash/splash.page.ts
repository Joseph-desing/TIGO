import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SplashPage implements OnInit {

  showButtons = false;

  constructor(
    private router: Router
  ) {}

  async ngOnInit() {
    // Espera 2 segundos para mostrar el splash
    await this.delay(2000);
    this.showButtons = true;
  }

  explorarInvitado() {
  console.log('Click en Explorar como invitado');
  localStorage.setItem('rol', 'invitado');
  this.router.navigate(['/pages/dashboard-invitado'], { replaceUrl: true });
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
