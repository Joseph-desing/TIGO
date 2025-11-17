export interface Plan {
  id?: string;
  nombre: string;
  nombre_comercial: string;
  precio: number;
  segmento: 'basico' | 'medio' | 'premium';
  
  // Características técnicas
  datos_moviles: string; // ej: "5 GB", "15 GB", "ILIMITADOS"
  minutos_voz: string; // ej: "100 minutos", "ILIMITADOS"
  sms: string; // ej: "Ilimitados"
  velocidad_4g: string; // ej: "Hasta 50 Mbps"
  velocidad_5g?: string; // ej: "Hasta 300 Mbps"
  
  // Beneficios
  redes_sociales: string; // ej: "Consumo normal", "Facebook, Instagram, TikTok GRATIS"
  whatsapp: string; // ej: "Incluido en los 5GB", "Ilimitado"
  llamadas_internacionales: string; // ej: "$0.15/min"
  roaming: string; // ej: "No incluido", "500 MB incluidos"
  
  // Información adicional
  descripcion?: string;
  caracteristicas?: string[]; // Array de características destacadas
  imagen_url?: string; // URL de la imagen promocional
  activo: boolean;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string; // ID del asesor que lo creó
}

export interface PlanCreate extends Omit<Plan, 'id' | 'created_at' | 'updated_at'> {}

export interface PlanUpdate extends Partial<PlanCreate> {
  id: string;
}