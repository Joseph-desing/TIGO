import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonicModule,   // 👉 aquí vienen ion-tabs, ion-tab-bar, ion-icon, etc.
    CommonModule,
    RouterModule   // 👉 para [routerLink]
  ],
})
export class TabsPage {
  constructor() {}
}
