import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-plan',
  templateUrl: './detalle-plan.page.html',
  styleUrls: ['./detalle-plan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule],
})
export class DetallePlanPage implements OnInit {

  planForm!: FormGroup;
  planId: number | null = null;
  modoEdicion = false;

  // 🔹 MOCK de planes (luego esto se reemplaza por Supabase)
  private MOCK_PLANES = [
    {
      id: 1,
      nombre: 'Plan Smart 5GB',
      precio: 15.99,
      datos: '5 GB',
      minutos: '100 min',
      descripcion: 'Perfecto para navegar y estar conectado',
      promocion: '¡Primer mes gratis!'
    },
    {
      id: 2,
      nombre: 'Plan Premium 10GB',
      precio: 24.99,
      datos: '10 GB',
      minutos: 'Ilimitado',
      descripcion: 'Ideal para redes sociales y streaming',
      promocion: ''
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.planId = +idParam;
      this.modoEdicion = true;
      this.cargarPlan(this.planId);
    }
  }

  initForm() {
    this.planForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0)]],
      datos: ['', Validators.required],
      minutos: ['', Validators.required],
      descripcion: ['', Validators.required],
      promocion: ['']
    });
  }

  // 🔹 Cargar datos de ejemplo según el ID (luego será desde Supabase)
  cargarPlan(id: number) {
    const plan = this.MOCK_PLANES.find(p => p.id === id);
    if (plan) {
      this.planForm.patchValue({
        nombre: plan.nombre,
        precio: plan.precio,
        datos: plan.datos,
        minutos: plan.minutos,
        descripcion: plan.descripcion,
        promocion: plan.promocion
      });
    }
  }

  async guardar() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const datos = this.planForm.value;
    console.log('✅ Datos del plan a guardar:', { id: this.planId, ...datos });

    // TODO: aquí llamas a Supabase:
    // - si this.modoEdicion === true → update en planes_moviles
    // - si no → insert nuevo plan

    const toast = await this.toastCtrl.create({
      message: this.modoEdicion
        ? 'Plan actualizado correctamente'
        : 'Plan creado correctamente',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    // Volver al dashboard del asesor
    this.router.navigate(['/pages/dashboard-asesor']);
  }

  cancelar() {
    this.router.navigate(['/pages/dashboard-asesor']);
  }
}
