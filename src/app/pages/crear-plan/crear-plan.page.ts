import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../core/services/supabase';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.page.html',
  styleUrls: ['./crear-plan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export class CrearPlanPage implements OnInit {

  planForm!: FormGroup;
  loading = false;
  imagenFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.planForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: ['', Validators.required],
      datos: ['', Validators.required],       // datos móviles en GB
      minutos: ['', Validators.required],     // minutos de voz
      descripcion: ['', Validators.required],
      promocion: ['']                         // se guarda como "caracteristicas"
    });
  }

  // ---------------------------------------
  // SUBIR IMAGEN
  // ---------------------------------------
  subirImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        this.imagenFile = input.files[0];
      }
    };

    input.click();
  }

  // ---------------------------------------
  // GUARDAR PLAN EN SUPABASE
  // ---------------------------------------
  async guardarPlan() {
    if (this.planForm.invalid) return;

    this.loading = true;

    try {
      const supabase = this.supabaseService.getClient();

      // Usuario actual (asesor)
      const usuario = this.authService.getCurrentUser();
      const createdBy = usuario?.id || null;

      // ---------------------------------------
      // SUBIR IMAGEN AL STORAGE (si elige)
      // ---------------------------------------
      let imagenUrl: string | null = null;

      if (this.imagenFile) {
        const fileName = `plan_${Date.now()}_${this.imagenFile.name}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('planes-moviles-imagenes')    // ⚠️ CAMBIA ESTE NOMBRE POR TU BUCKET REAL
          .upload(fileName, this.imagenFile);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: publicUrlData } = supabase
          .storage
          .from('planes-moviles-imagenes')    // ⚠️ CAMBIA ESTE NOMBRE POR TU BUCKET
          .getPublicUrl(uploadData.path);

        imagenUrl = publicUrlData.publicUrl;
      }

      const f = this.planForm.value;

      // ---------------------------------------
      // INSERTAR EN LA TABLA planes_moviles
      // ---------------------------------------
      const { data, error } = await supabase
        .from('planes_moviles')
        .insert({
          nombre: f.nombre,
          nombre_comercial: f.nombre,
          precio: Number(f.precio),

          segmento: 'Móvil', // puedes cambiarlo por un select después

          datos_moviles: `${f.datos} GB`,
          minutos_voz: `${f.minutos} min`,

          sms: null,
          velocidad_4g: null,
          velocidad_5g: null,
          redes_sociales: null,
          whatsapp: null,
          llamadas_internacionales: null,
          roaming: null,

          descripcion: f.descripcion,
          caracteristicas: f.promocion || null,

          imagen_url: imagenUrl,
          activo: true,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      await this.showToast('Plan creado correctamente', 'success');

      // Regresar al dashboard
      this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });

    } catch (err) {
      console.error(err);
      await this.showToast('No se pudo crear el plan', 'danger');
    } finally {
      this.loading = false;
    }
  }

  // ---------------------------------------
  // TOAST
  // ---------------------------------------
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
