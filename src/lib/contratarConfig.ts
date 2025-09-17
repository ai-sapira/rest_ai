// Configuración global para la sección "Contratar"

export type ContratarCategoryKey =
  | 'maquinaria'
  | 'mobiliario'
  | 'utensilios'
  | 'menaje'
  | 'bodega'
  | 'aprovisionamientos'
  | 'servicios';

export type UnifiedTypeFilter = 'todos' | 'venta' | 'compra' | 'alquiler' | 'servicio';

export interface PriceRange {
  id: 'bajo' | 'medio' | 'alto';
  label: string;
  test: (precio: number) => boolean;
}

export interface CategoryConfig {
  priceRanges: PriceRange[];
  conditionOptions: string[];
  subcategories: string[];
  allowRental?: boolean; // Permite alquiler en esta categoría
}

export const contratarConfig: Record<ContratarCategoryKey, CategoryConfig> = {
  maquinaria: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €2,000', test: (p) => p < 2000 },
      { id: 'medio', label: '€2,000 - €5,000', test: (p) => p >= 2000 && p <= 5000 },
      { id: 'alto', label: 'Más de €5,000', test: (p) => p > 5000 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: true,
    subcategories: [
      'Hornos', 'Horno de pizza', 'Horno de convección', 'Horno mixto', 'Salamandras',
      'Cocinas industriales', 'Planchas', 'Parrillas', 'Freidoras',
      'Lavavajillas', 'Lavavasos', 'Lavaperolas',
      'Cámaras frigoríficas', 'Mesas frías', 'Abatidores', 'Vitrinas refrigeradas',
      'Batidoras', 'Amasadoras', 'Picadoras', 'Cortadoras', 'Envasadoras', 'Termoselladoras',
      'Licuadoras', 'Cafeteras industriales', 'Molinos de café', 'Exprimidores', 'Trituradores',
      'Fabricadores de hielo',
      'Fregaderos', 'Mesas de trabajo', 'Carros de servicio'
    ],
  },
  mobiliario: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €1,000', test: (p) => p < 1000 },
      { id: 'medio', label: '€1,000 - €3,000', test: (p) => p >= 1000 && p <= 3000 },
      { id: 'alto', label: 'Más de €3,000', test: (p) => p > 3000 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: true,
    subcategories: [
      'Mesas', 'Sillas', 'Taburetes', 'Bancos',
      'Barras', 'Backbar',
      'Estanterías', 'Aparadores', 'Vitrinas', 'Muebles refrigerados',
      'Sofás', 'Butacas', 'Bancadas',
      'Mobiliario de terraza', 'Sombrillas', 'Tumbonas',
      'Separadores', 'Biombos', 'Iluminación decorativa', 'Percheros', 'Carros de sala'
    ],
  },
  utensilios: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €300', test: (p) => p < 300 },
      { id: 'medio', label: '€300 - €800', test: (p) => p >= 300 && p <= 800 },
      { id: 'alto', label: 'Más de €800', test: (p) => p > 800 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: true,
    subcategories: [
      'Cuchillos', 'Chairs', 'Tablas de corte',
      'Sartenes', 'Ollas', 'Cazos', 'Cacerolas',
      'Bandejas GN', 'Gastronorm',
      'Moldes', 'Utillaje de pastelería',
      'Espátulas', 'Cucharones', 'Pinzas',
      'Ralladores', 'Coladores', 'Termómetros',
      'Jarras medidoras', 'Dosificadores',
      'Sacacorchos', 'Abridores',
      'Menaje de bar', 'Shakers', 'Estaciones de coctelería'
    ],
  },
  menaje: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €200', test: (p) => p < 200 },
      { id: 'medio', label: '€200 - €600', test: (p) => p >= 200 && p <= 600 },
      { id: 'alto', label: 'Más de €600', test: (p) => p > 600 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: true,
    subcategories: [
      'Vajilla', 'Platos llanos', 'Platos hondos', 'Fuentes', 'Bols',
      'Tazas', 'Platillos', 'Jarras', 'Jarras de cerveza',
      'Copas de vino', 'Copas de cóctel', 'Vasos',
      'Cubiertos', 'Cubertería premium',
      'Cestas de pan', 'Ceniceros',
      'Mantelería', 'Servilleteros',
      'Expositores', 'Bandejas', 'Campanas cloche'
    ],
  },
  bodega: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €150', test: (p) => p < 150 },
      { id: 'medio', label: '€150 - €500', test: (p) => p >= 150 && p <= 500 },
      { id: 'alto', label: 'Más de €500', test: (p) => p > 500 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: false, // ❌ NO permite alquiler
    subcategories: [
      'Vinos tintos', 'Vinos blancos', 'Rosados', 'Espumosos', 'Vermut',
      'Destilados', 'Licores',
      'Cervezas artesanas', 'Cervezas de importación', 'Sidras',
      'Refrescos', 'Aguas', 'Mixers', 'Puré/Sirope',
      'Café en grano', 'Té e infusiones'
    ],
  },
  aprovisionamientos: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €100', test: (p) => p < 100 },
      { id: 'medio', label: '€100 - €300', test: (p) => p >= 100 && p <= 300 },
      { id: 'alto', label: 'Más de €300', test: (p) => p > 300 },
    ],
    conditionOptions: ['nuevo', 'como nuevo', 'usado'],
    allowRental: false, // ❌ NO permite alquiler
    subcategories: [
      'Carnes vacuno', 'Carnes porcino', 'Aves', 'Caza',
      'Pescados blancos', 'Pescados azules', 'Mariscos',
      'Verduras', 'Frutas', 'IV gama', 'V gama',
      'Lácteos', 'Quesos', 'Huevos',
      'Panadería', 'Pastelería',
      'Congelados', 'Conservas',
      'Embutidos', 'Charcutería',
      'Especias', 'Salsas', 'Aceites y vinagres',
      'Arroces y pastas', 'Legumbres',
      'Productos veganos', 'Sin gluten'
    ],
  },
  servicios: {
    priceRanges: [
      { id: 'bajo', label: 'Menos de €20/hora', test: (p) => p < 20 },
      { id: 'medio', label: '€20 - €50/hora', test: (p) => p >= 20 && p <= 50 },
      { id: 'alto', label: 'Más de €50/hora', test: (p) => p > 50 },
    ],
    conditionOptions: ['disponible', 'ocupado parcialmente', 'no disponible'],
    allowRental: false, // Servicios no se "alquilan"
    subcategories: [
      'Chef / Cocinero',
      'Camarero / Mesero',
      'Barista',
      'Sommelier',
      'Ayudante de Cocina',
      'Personal de Limpieza',
      'Recepcionista',
      'Gerente de Restaurante',
      'Nutricionista',
      'Consultoria de Negocio',
      'Marketing y Publicidad',
      'Contabilidad y Finanzas',
      'Mantenimiento y Reparaciones',
      'Diseño de Interiores',
      'Fotografía Gastronómica',
      'Otros servicios'
    ],
  },
};

// Helpers de tipos unificados
export function matchesUnifiedType(selected: UnifiedTypeFilter | string, rawTipo: string): boolean {
  if (selected === 'todos') return true;
  if (selected === 'venta') return rawTipo === 'vendo';
  if (selected === 'compra') return rawTipo === 'busco' || rawTipo === 'compro';
  if (selected === 'alquiler') return rawTipo === 'alquilo' || rawTipo === 'busco_alquiler';
  if (selected === 'servicio') return rawTipo === 'oferta' || rawTipo === 'busco_servicio';
  if (selected === 'busco_servicio') return rawTipo === 'busco_servicio';
  return true;
}

export function getUnifiedTypeLabel(rawTipo: string): 'VENTA' | 'COMPRA' | 'ALQUILER' | 'SERVICIO' {
  if (rawTipo === 'vendo') return 'VENTA';
  if (rawTipo === 'busco' || rawTipo === 'compro') return 'COMPRA';
  if (rawTipo === 'alquilo' || rawTipo === 'busco_alquiler') return 'ALQUILER';
  if (rawTipo === 'oferta' || rawTipo === 'busco_servicio') return 'SERVICIO';
  return 'SERVICIO';
}

export function getUnifiedTypeColor(rawTipo: string): string {
  if (rawTipo === 'vendo') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (rawTipo === 'busco' || rawTipo === 'compro') return 'bg-purple-100 text-purple-800 border-purple-200';
  if (rawTipo === 'alquilo' || rawTipo === 'busco_alquiler') return 'bg-green-100 text-green-800 border-green-200';
  if (rawTipo === 'oferta' || rawTipo === 'busco_servicio') return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

// Helper específico para servicios
export function getServiceTypeLabel(rawTipo: string): 'OFREZCO' | 'BUSCO' | 'SERVICIO' {
  if (rawTipo === 'oferta') return 'OFREZCO';
  if (rawTipo === 'busco_servicio') return 'BUSCO';
  return 'SERVICIO';
}

export function getServiceTypeColor(rawTipo: string): string {
  if (rawTipo === 'oferta') return 'bg-orange-100 text-orange-800 border-orange-200';
  if (rawTipo === 'busco_servicio') return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-orange-100 text-orange-800 border-orange-200';
}

// Helper para obtener tipos permitidos por categoría
export function getAllowedTypesForCategory(categoryKey: ContratarCategoryKey): Array<{ id: string; label: string }> {
  const config = contratarConfig[categoryKey];
  const baseTypes = [
    { id: 'venta', label: 'Venta' },
    { id: 'compra', label: 'Compra' },
  ];

  if (config.allowRental) {
    baseTypes.push({ id: 'alquiler', label: 'Alquiler' });
  }

  // Servicios tiene sus propios tipos
  if (categoryKey === 'servicios') {
    return [
      { id: 'servicio', label: 'Ofrecer Servicio' },
      { id: 'busco_servicio', label: 'Busco Servicio' },
    ];
  }

  return baseTypes;
}


