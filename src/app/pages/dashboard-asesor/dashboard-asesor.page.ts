import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard-asesor',
  templateUrl: './dashboard-asesor.page.html',
  styleUrls: ['./dashboard-asesor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DashboardAsesorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
