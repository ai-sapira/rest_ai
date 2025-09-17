import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, Upload, MapPin, Euro, Package, ShoppingCart, Calendar, Search, Star } from "lucide-react";
import { contratarConfig, type ContratarCategoryKey } from "@/lib/contratarConfig";

interface CreateAnuncioFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

interface FormData {
  type: 'vendo' | 'compro' | 'alquilo' | 'busco_alquiler' | 'servicio' | null;
  // Subtipo de servicio
  serviceType: 'ofrezco' | 'busco' | null;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  state: string;
  price: string;
  rentalPriceDay: string;
  rentalPriceWeek: string;
  rentalPriceMonth: string;
  currency: string;
  dimensions: {
    width: string;
    height: string;
    depth: string;
  };
  location: {
    region: string;
    province: string;
    city: string;
  };
  images: File[];
  shipping: boolean;
  actorType: 'user' | 'provider';
}

const INITIAL_FORM_DATA: FormData = {
  type: null,
  serviceType: null,
  category: '',
  subcategory: '',
  title: '',
  description: '',
  state: '',
  price: '',
  rentalPriceDay: '',
  rentalPriceWeek: '',
  rentalPriceMonth: '',
  currency: 'EUR',
  dimensions: { width: '', height: '', depth: '' },
  location: { region: '', province: '', city: '' },
  images: [],
  shipping: false,
  actorType: 'user'
};

const MAQUINARIA_SUBCATEGORIES = [
  'Hornos',
  'Freidoras', 
  'Planchas',
  'Lavavajillas',
  'Refrigeración',
  'Cafeteras',
  'Batidoras/Mezcladoras',
  'Cortadoras/Rebanadoras',
  'Otros equipos'
];

const PRODUCT_STATES = [
  'Nuevo',
  'Semi-nuevo',
  'Usado - Buen estado',
  'Usado - Estado aceptable',
  'Para reparar'
];

export function CreateAnuncioForm({ isOpen, onClose, category = 'maquinaria' }: CreateAnuncioFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Get allowed types for current category
  const categoryConfig = contratarConfig[category as ContratarCategoryKey];
  const allowsRental = categoryConfig?.allowRental !== false;

  // Dynamic type options based on category
  const getTypeOptions = () => {
    const baseOptions = [
      { id: 'vendo', label: 'Venta', icon: Package, description: 'Vendo algo que ya no necesito' },
      { id: 'compro', label: 'Compra', icon: ShoppingCart, description: 'Busco algo específico para comprar' }
    ];

    if (allowsRental && category !== 'servicios') {
      baseOptions.push({ id: 'alquilo', label: 'Alquiler', icon: Calendar, description: 'Alquiler de equipamiento' });
    }

    if (category === 'servicios') {
      baseOptions.push({ id: 'servicio', label: 'Servicios', icon: Star, description: 'Servicios profesionales' });
    }

    return baseOptions;
  };

  // Progress calculation
  const totalSections = 5;
  const progress = (completedSections.size / totalSections) * 100;

  // Section validation
  const isSectionComplete = (section: number): boolean => {
    switch (section) {
      case 1: // Tipo de anuncio
        if (formData.type === 'servicio') {
          return !!(formData.type && formData.serviceType);
        }
        return !!formData.type;
      case 2: // Información básica
        return !!(formData.title && formData.description && formData.subcategory);
      case 3: // Detalles del producto
        if (formData.type === 'busco') return !!formData.state;
        if (formData.type === 'alquilo') {
          return !!(formData.state && (
            formData.rentalPriceDay || 
            formData.rentalPriceWeek || 
            formData.rentalPriceMonth
          ));
        }
        if (formData.type === 'busco_alquiler') {
          return !!(formData.state && formData.rentalPriceMonth);
        }
        return !!(formData.state && formData.price);
      case 4: // Fotos
        return formData.images.length > 0 || formData.type === 'busco';
      case 5: // Ubicación
        return !!(formData.location.region && formData.location.province && formData.location.city);
      default:
        return false;
    }
  };

  // Update completed sections when form data changes
  useEffect(() => {
    const newCompleted = new Set<number>();
    for (let i = 1; i <= totalSections; i++) {
      if (isSectionComplete(i)) {
        newCompleted.add(i);
      }
    }
    setCompletedSections(newCompleted);
  }, [formData]);

  // Navigate to next available section
  const goToNextSection = () => {
    if (currentSection < totalSections && isSectionComplete(currentSection)) {
      setCurrentSection(currentSection + 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (field: keyof FormData, nestedField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field as keyof FormData], [nestedField]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Crear anuncio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Completa la información paso a paso
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progreso</span>
              <span>{completedSections.size}/{totalSections} secciones</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">

            {/* Section 1: Tipo de anuncio */}
            <Card className={`transition-all duration-300 ${currentSection >= 1 ? 'ring-2 ring-blue-100' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSections.has(1) ? 'bg-green-100 text-green-700' : 
                    currentSection === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    1
                  </div>
                  <h3 className="text-lg font-medium">¿Qué vas a hacer?</h3>
                  {completedSections.has(1) && (
                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                      Completado
                    </Badge>
                  )}
                </div>

                {!allowsRental && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Nota:</strong> Los productos de {category} no están disponibles para alquiler. 
                      Solo puedes vender o buscar productos de esta categoría.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTypeOptions().map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          updateFormData('type', option.id as 'vendo' | 'compro' | 'alquilo' | 'servicio');
                          if (option.id !== 'alquilo' && option.id !== 'servicio' && currentSection === 1) goToNextSection();
                        }}
                        className={`p-4 rounded-lg border-2 transition-all hover:border-repsol-orange/50 ${
                          formData.type === option.id 
                            ? 'border-repsol-orange bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mx-auto mb-2 ${
                          formData.type === option.id ? 'text-repsol-orange' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Subtipo de servicio */}
                {formData.type === 'servicio' && (
                  <div className="space-y-4 mt-6">
                    <p className="text-sm font-medium text-gray-700">
                      ¿Qué tipo de servicio?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          updateFormData('serviceType', 'ofrezco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        className={`p-4 rounded-lg border-2 transition-all hover:border-repsol-orange/50 ${
                          formData.serviceType === 'ofrezco'
                            ? 'border-repsol-orange bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`h-6 w-6 mx-auto mb-2 ${
                          formData.serviceType === 'ofrezco' ? 'text-repsol-orange' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-medium">Ofrezco servicio</div>
                        <div className="text-xs text-gray-500 mt-1">Tengo un servicio profesional para ofrecer</div>
                      </button>
                      
                      <button
                        onClick={() => {
                          updateFormData('serviceType', 'busco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        className={`p-4 rounded-lg border-2 transition-all hover:border-repsol-orange/50 ${
                          formData.serviceType === 'busco'
                            ? 'border-repsol-orange bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Search className={`h-6 w-6 mx-auto mb-2 ${
                          formData.serviceType === 'busco' ? 'text-repsol-orange' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-medium">Busco servicio</div>
                        <div className="text-xs text-gray-500 mt-1">Necesito contratar un servicio profesional</div>
                      </button>
                    </div>
                  </div>
                )}

                {completedSections.has(1) && currentSection === 1 && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={goToNextSection} className="gap-2">
                      Continuar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Información básica - Solo visible si Section 1 está completa */}
            {completedSections.has(1) && (
              <Card className={`transition-all duration-300 ${currentSection >= 2 ? 'ring-2 ring-blue-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSections.has(2) ? 'bg-green-100 text-green-700' : 
                      currentSection === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      2
                    </div>
                    <h3 className="text-lg font-medium">Información del producto</h3>
                    {completedSections.has(2) && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Subcategoría */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Categoría y subcategoría
                      </label>
                      <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAQUINARIA_SUBCATEGORIES.map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Título*
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="Ej: Horno industrial marca Rational..."
                        maxLength={80}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.title.length}/80
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Descripción*
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe el producto con el máximo detalle posible..."
                        maxLength={500}
                        rows={4}
                        className="w-full resize-none"
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.description.length}/500
                      </div>
                    </div>
                  </div>

                  {completedSections.has(2) && currentSection === 2 && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={goToNextSection} className="gap-2">
                        Continuar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 3: Detalles del producto - Solo visible si Section 2 está completa */}
            {completedSections.has(2) && (
              <Card className={`transition-all duration-300 ${currentSection >= 3 ? 'ring-2 ring-blue-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSections.has(3) ? 'bg-green-100 text-green-700' : 
                      currentSection === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      3
                    </div>
                    <h3 className="text-lg font-medium">Detalles del producto</h3>
                    {completedSections.has(3) && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Estado */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Estado*
                      </label>
                      <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dimensiones */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Medidas del producto
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Input
                            value={formData.dimensions.width}
                            onChange={(e) => updateNestedFormData('dimensions', 'width', e.target.value)}
                            placeholder="Ancho en cm"
                          />
                        </div>
                        <div>
                          <Input
                            value={formData.dimensions.height}
                            onChange={(e) => updateNestedFormData('dimensions', 'height', e.target.value)}
                            placeholder="Alto en cm"
                          />
                        </div>
                        <div>
                          <Input
                            value={formData.dimensions.depth}
                            onChange={(e) => updateNestedFormData('dimensions', 'depth', e.target.value)}
                            placeholder="Fondo en cm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Precio de venta/compra */}
                    {(formData.type === 'vendo' || formData.type === 'compro' || formData.type === 'oferta') && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {formData.type === 'vendo' ? 'Precio de venta*' : 
                           formData.type === 'compro' ? 'Presupuesto máximo*' : 
                           'Precio por hora*'}
                        </label>
                        <div className="flex gap-3">
                          <Input
                            value={formData.price}
                            onChange={(e) => updateFormData('price', e.target.value)}
                            placeholder="0"
                            type="number"
                            className="flex-1"
                          />
                          <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">€</SelectItem>
                              <SelectItem value="USD">$</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.type === 'compro' ? 'Indica tu presupuesto máximo' : 'Sé razonable con el precio'}
                        </p>
                      </div>
                    )}

                    {/* Precios de alquiler */}
                    {formData.type === 'alquilo' && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Precios de alquiler*
                        </label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Por día</label>
                            <div className="flex gap-2">
                              <Input
                                value={formData.rentalPriceDay}
                                onChange={(e) => updateFormData('rentalPriceDay', e.target.value)}
                                placeholder="45"
                                type="number"
                                className="flex-1"
                              />
                              <span className="flex items-center text-sm text-gray-500">€/día</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Por semana</label>
                            <div className="flex gap-2">
                              <Input
                                value={formData.rentalPriceWeek}
                                onChange={(e) => updateFormData('rentalPriceWeek', e.target.value)}
                                placeholder="280"
                                type="number"
                                className="flex-1"
                              />
                              <span className="flex items-center text-sm text-gray-500">€/semana</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Por mes</label>
                            <div className="flex gap-2">
                              <Input
                                value={formData.rentalPriceMonth}
                                onChange={(e) => updateFormData('rentalPriceMonth', e.target.value)}
                                placeholder="950"
                                type="number"
                                className="flex-1"
                              />
                              <span className="flex items-center text-sm text-gray-500">€/mes</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Completa al menos uno de los precios</p>
                      </div>
                    )}

                    {/* Presupuesto para busco_alquiler */}
                    {formData.type === 'busco_alquiler' && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Presupuesto máximo*
                        </label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Por mes</label>
                            <div className="flex gap-2">
                              <Input
                                value={formData.rentalPriceMonth}
                                onChange={(e) => updateFormData('rentalPriceMonth', e.target.value)}
                                placeholder="600"
                                type="number"
                                className="flex-1"
                              />
                              <span className="flex items-center text-sm text-gray-500">€/mes</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Indica tu presupuesto mensual</p>
                      </div>
                    )}
                  </div>

                  {completedSections.has(3) && currentSection === 3 && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={goToNextSection} className="gap-2">
                        Continuar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Placeholder for remaining sections */}
            {completedSections.has(3) && (
              <Card className="border-dashed border-gray-300">
                <CardContent className="p-6 text-center text-gray-500">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>Más secciones se irán desbloqueando...</p>
                  <p className="text-sm">Fotos • Ubicación</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {completedSections.size > 0 && (
                <span>
                  Has completado {completedSections.size} de {totalSections} secciones
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {completedSections.size === totalSections && (
                <Button>
                  Publicar anuncio
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

