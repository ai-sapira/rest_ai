import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { useAnuncios, type Anuncio } from "@/hooks/useAnuncios";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Check,
  Package,
  MapPin,
  DollarSign,
  Upload,
  ChevronRight,
  X,
  Image as ImageIcon,
  Camera,
  AlertTriangle,
  Calendar,
  Search,
  Star,
  ShoppingCart
} from "lucide-react";

interface FormData {
  tipo: 'vendo' | 'busco' | 'oferta' | 'alquilo' | 'busco_alquiler' | 'busco_servicio' | null;
  categoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  estado_producto: string;
  precio: string;
  precio_alquiler_dia: string;
  precio_alquiler_semana: string;
  precio_alquiler_mes: string;
  moneda: string;
  dimensiones: {
    width: string;
    height: string;
    depth: string;
  };
  ubicacion: {
    region: string;
    province: string;
    city: string;
  };
  imagenes: File[];
  envio: boolean;
}

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

const SPANISH_REGIONS = [
  'Andalucía',
  'Aragón', 
  'Asturias',
  'Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'Madrid',
  'Murcia',
  'Navarra',
  'País Vasco',
  'La Rioja',
  'Ceuta',
  'Melilla'
];

export default function AnuncioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateAnuncio } = useAnuncios();

  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tipo: null,
    categoria: '',
    subcategoria: '',
    titulo: '',
    descripcion: '',
    estado_producto: '',
    precio: '',
    precio_alquiler_dia: '',
    precio_alquiler_semana: '',
    precio_alquiler_mes: '',
    moneda: 'EUR',
    dimensiones: { width: '', height: '', depth: '' },
    ubicacion: { region: '', province: '', city: '' },
    imagenes: [],
    envio: false
  });
  
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Progress calculation
  const totalSections = 5;
  const progress = (completedSections.size / totalSections) * 100;

  // Load anuncio data
  useEffect(() => {
    if (!id || !user) return;

    const fetchAnuncio = async () => {
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase');
        
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Check if user owns this anuncio
        if (data.user_id !== user.id) {
          toast({
            title: "Error",
            description: "No tienes permiso para editar este anuncio.",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        
        setAnuncio(data);
        
        // Pre-fill form data
        setFormData({
          tipo: data.tipo,
          categoria: data.categoria,
          subcategoria: data.subcategoria,
          titulo: data.titulo,
          descripcion: data.descripcion,
          estado_producto: data.estado_producto,
          precio: data.precio?.toString() || '',
          precio_alquiler_dia: data.precio_alquiler_dia?.toString() || '',
          precio_alquiler_semana: data.precio_alquiler_semana?.toString() || '',
          precio_alquiler_mes: data.precio_alquiler_mes?.toString() || '',
          moneda: data.moneda,
          dimensiones: {
            width: data.dimensiones?.width || '',
            height: data.dimensiones?.height || '',
            depth: data.dimensiones?.depth || ''
          },
          ubicacion: {
            region: data.ubicacion?.region || '',
            province: data.ubicacion?.province || '',
            city: data.ubicacion?.city || ''
          },
          imagenes: [],
          envio: data.envio
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Error al cargar el anuncio.",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncio();
  }, [id, user, navigate, toast]);

  // Section validation
  const isSectionComplete = (section: number): boolean => {
    switch (section) {
      case 1: // Tipo de anuncio
        return !!formData.tipo;
      case 2: // Información básica
        return !!(formData.titulo && formData.descripcion && formData.subcategoria);
      case 3: // Detalles del producto
        if (formData.tipo === 'busco' || formData.tipo === 'busco_servicio') {
          return !!formData.estado_producto;
        }
        if (formData.tipo === 'alquilo') {
          return !!(formData.estado_producto && (
            formData.precio_alquiler_dia || 
            formData.precio_alquiler_semana || 
            formData.precio_alquiler_mes
          ));
        }
        if (formData.tipo === 'busco_alquiler') {
          return !!(formData.estado_producto && formData.precio_alquiler_mes);
        }
        return !!(formData.estado_producto && formData.precio);
      case 4: // Fotos
        return true; // Always complete for editing
      case 5: // Ubicación
        return !!(formData.ubicacion.region && formData.ubicacion.province && formData.ubicacion.city);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const currentImages = formData.imagenes || [];
      const totalImages = currentImages.length + newFiles.length;
      
      if (totalImages > 6) {
        toast({
          title: "Límite de imágenes",
          description: "Solo puedes subir máximo 6 imágenes.",
          variant: "destructive",
        });
        return;
      }
      
      updateFormData('imagenes', [...currentImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.imagenes || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateFormData('imagenes', newImages);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (!anuncio || !id) return;

    try {
      setSaving(true);
      
      // Transform form data to match the database schema
      const updateData = {
        tipo: formData.tipo as 'vendo' | 'busco' | 'oferta' | 'alquilo' | 'busco_alquiler' | 'busco_servicio',
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado_producto: formData.estado_producto,
        precio: formData.precio ? parseFloat(formData.precio) : undefined,
        precio_alquiler_dia: formData.precio_alquiler_dia ? parseFloat(formData.precio_alquiler_dia) : undefined,
        precio_alquiler_semana: formData.precio_alquiler_semana ? parseFloat(formData.precio_alquiler_semana) : undefined,
        precio_alquiler_mes: formData.precio_alquiler_mes ? parseFloat(formData.precio_alquiler_mes) : undefined,
        moneda: formData.moneda,
        dimensiones: {
          width: formData.dimensiones.width,
          height: formData.dimensiones.height,
          depth: formData.dimensiones.depth
        },
        ubicacion: {
          region: formData.ubicacion.region,
          province: formData.ubicacion.province,
          city: formData.ubicacion.city
        },
        envio: formData.envio
      };

      const success = await updateAnuncio(id, updateData);

      if (success) {
        toast({
          title: "¡Anuncio actualizado!",
          description: "Los cambios se han guardado exitosamente.",
        });
        
        navigate(`/platform/anuncios/${id}`);
      }
    } catch (error) {
      console.error('Error updating anuncio:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el anuncio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.main 
        className="flex-1 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-repsol-orange mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando anuncio...</p>
            </div>
          </div>
        </div>
      </motion.main>
    );
  }

  if (!anuncio) {
    return (
      <motion.main 
        className="flex-1 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Anuncio no encontrado</h3>
              <p className="text-red-600 mb-4">No se pudo cargar la información del anuncio.</p>
              <Button variant="outline" onClick={handleGoBack}>
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      className="flex-1 p-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header matching contratar section style */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-repsol-orange" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar anuncio</h1>
              <p className="text-gray-600 mt-1">Modifica la información de tu anuncio</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <Badge variant="outline" className="text-gray-600">
              {completedSections.size} de {totalSections} secciones
            </Badge>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Section 1: Tipo de anuncio */}
          <Card className={`transition-all ${currentSection >= 1 ? 'ring-2 ring-repsol-orange/20 shadow-lg' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  completedSections.has(1) 
                    ? 'bg-green-100 text-green-700' 
                    : currentSection === 1 
                      ? 'bg-repsol-orange text-white' 
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {completedSections.has(1) ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <CardTitle className="text-gray-900">¿Qué vas a hacer?</CardTitle>
                {completedSections.has(1) && (
                  <Badge className="bg-green-100 text-green-700">Completado</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'vendo', label: 'Venta', icon: Package, description: 'Vendo algo que ya no necesito' },
                  { id: 'busco', label: 'Compra', icon: ShoppingCart, description: 'Busco algo específico para comprar' },
                  { id: 'alquilo', label: 'Alquiler', icon: Calendar, description: 'Ofrezco algo en alquiler' },
                  { id: 'busco_alquiler', label: 'Busco Alquiler', icon: Search, description: 'Necesito alquilar algo' },
                  { id: 'oferta', label: 'Ofrezco Servicio', icon: Star, description: 'Ofrezco un servicio profesional' },
                  { id: 'busco_servicio', label: 'Busco Servicio', icon: Search, description: 'Necesito contratar un servicio' }
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.tipo === option.id 
                        ? 'ring-2 ring-repsol-orange bg-orange-50' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    onClick={() => {
                      updateFormData('tipo', option.id as 'vendo' | 'busco' | 'oferta' | 'alquilo' | 'busco_alquiler' | 'busco_servicio');
                      if (currentSection === 1) goToNextSection();
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <option.icon className={`h-8 w-8 mx-auto mb-3 ${
                        formData.tipo === option.id ? 'text-repsol-orange' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-sm mb-1">{option.label}</h3>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {completedSections.has(1) && currentSection === 1 && (
                <div className="flex justify-end pt-4">
                  <Button onClick={goToNextSection} className="bg-repsol-orange hover:bg-repsol-orange/90">
                    Continuar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Información básica */}
          {completedSections.has(1) && (
            <Card className={`transition-all ${currentSection >= 2 ? 'ring-2 ring-repsol-orange/20 shadow-lg' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completedSections.has(2) 
                      ? 'bg-green-100 text-green-700' 
                      : currentSection === 2 
                        ? 'bg-repsol-orange text-white' 
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completedSections.has(2) ? <Check className="h-4 w-4" /> : "2"}
                  </div>
                  <CardTitle className="text-gray-900">Información del producto</CardTitle>
                  {completedSections.has(2) && (
                    <Badge className="bg-green-100 text-green-700">Completado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategoria" className="text-sm font-medium text-gray-700">
                    Categoría y subcategoría *
                  </Label>
                  <Select value={formData.subcategoria} onValueChange={(value) => updateFormData('subcategoria', value)}>
                    <SelectTrigger className="bg-white">
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
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-sm font-medium text-gray-700">
                    Título *
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => updateFormData('titulo', e.target.value)}
                    placeholder="Ej: Horno industrial marca Rational..."
                    maxLength={80}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.titulo.length}/80
                  </p>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                    Descripción *
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => updateFormData('descripcion', e.target.value)}
                    placeholder="Describe el producto con el máximo detalle posible..."
                    maxLength={500}
                    rows={4}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.descripcion.length}/500
                  </p>
                </div>

                {completedSections.has(2) && currentSection === 2 && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={goToNextSection} className="bg-repsol-orange hover:bg-repsol-orange/90">
                      Continuar
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Detalles del producto */}
          {completedSections.has(2) && (
            <Card className={`transition-all ${currentSection >= 3 ? 'ring-2 ring-repsol-orange/20 shadow-lg' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completedSections.has(3) 
                      ? 'bg-green-100 text-green-700' 
                      : currentSection === 3 
                        ? 'bg-repsol-orange text-white' 
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completedSections.has(3) ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                  <CardTitle className="text-gray-900">Detalles del producto</CardTitle>
                  {completedSections.has(3) && (
                    <Badge className="bg-green-100 text-green-700">Completado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Estado del producto */}
                <div className="space-y-2">
                  <Label htmlFor="estado_producto" className="text-sm font-medium text-gray-700">
                    Estado del producto *
                  </Label>
                  <Select value={formData.estado_producto} onValueChange={(value) => updateFormData('estado_producto', value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Precio de venta/compra */}
                {(formData.tipo === 'vendo' || formData.tipo === 'busco' || formData.tipo === 'oferta' || formData.tipo === 'busco_servicio') && (
                  <div className="space-y-2">
                    <Label htmlFor="precio" className="text-sm font-medium text-gray-700">
                      {formData.tipo === 'vendo' ? 'Precio de venta *' : 
                       formData.tipo === 'busco' ? 'Presupuesto máximo *' : 
                       formData.tipo === 'oferta' ? 'Precio por hora *' :
                       'Presupuesto *'}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="precio"
                        type="number"
                        value={formData.precio}
                        onChange={(e) => updateFormData('precio', e.target.value)}
                        placeholder="0"
                        className="bg-white flex-1"
                      />
                      <Select value={formData.moneda} onValueChange={(value) => updateFormData('moneda', value)}>
                        <SelectTrigger className="w-24 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">€</SelectItem>
                          <SelectItem value="USD">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Precios de alquiler */}
                {formData.tipo === 'alquilo' && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Precios de alquiler *
                    </Label>
                    <div className="grid gap-4">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Por día</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={formData.precio_alquiler_dia}
                            onChange={(e) => updateFormData('precio_alquiler_dia', e.target.value)}
                            placeholder="45"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center text-sm text-gray-500">€/día</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Por semana</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={formData.precio_alquiler_semana}
                            onChange={(e) => updateFormData('precio_alquiler_semana', e.target.value)}
                            placeholder="280"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center text-sm text-gray-500">€/semana</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Por mes</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={formData.precio_alquiler_mes}
                            onChange={(e) => updateFormData('precio_alquiler_mes', e.target.value)}
                            placeholder="950"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center text-sm text-gray-500">€/mes</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Completa al menos uno de los precios</p>
                  </div>
                )}

                {/* Presupuesto para busco_alquiler */}
                {formData.tipo === 'busco_alquiler' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Presupuesto máximo mensual *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.precio_alquiler_mes}
                        onChange={(e) => updateFormData('precio_alquiler_mes', e.target.value)}
                        placeholder="600"
                        className="bg-white flex-1"
                      />
                      <span className="flex items-center text-sm text-gray-500">€/mes</span>
                    </div>
                    <p className="text-xs text-gray-500">Indica tu presupuesto mensual máximo</p>
                  </div>
                )}

                {/* Dimensiones */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Medidas del producto
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Input
                        value={formData.dimensiones.width}
                        onChange={(e) => updateNestedFormData('dimensiones', 'width', e.target.value)}
                        placeholder="Ancho (cm)"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.dimensiones.height}
                        onChange={(e) => updateNestedFormData('dimensiones', 'height', e.target.value)}
                        placeholder="Alto (cm)"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.dimensiones.depth}
                        onChange={(e) => updateNestedFormData('dimensiones', 'depth', e.target.value)}
                        placeholder="Fondo (cm)"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Envío */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="envio"
                    checked={formData.envio}
                    onCheckedChange={(checked) => updateFormData('envio', checked)}
                  />
                  <Label htmlFor="envio" className="text-sm font-medium text-gray-700">
                    Ofrezco envío
                  </Label>
                </div>

                {completedSections.has(3) && currentSection === 3 && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={goToNextSection} className="bg-repsol-orange hover:bg-repsol-orange/90">
                      Continuar
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 4: Fotos */}
          {completedSections.has(3) && (
            <Card className={`transition-all ${currentSection >= 4 ? 'ring-2 ring-repsol-orange/20 shadow-lg' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completedSections.has(4) 
                      ? 'bg-green-100 text-green-700' 
                      : currentSection === 4 
                        ? 'bg-repsol-orange text-white' 
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completedSections.has(4) ? <Check className="h-4 w-4" /> : "4"}
                  </div>
                  <CardTitle className="text-gray-900">Fotos del producto</CardTitle>
                  {completedSections.has(4) && (
                    <Badge className="bg-green-100 text-green-700">Completado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {anuncio?.imagenes && anuncio.imagenes.length > 0 
                        ? `Imágenes actuales: ${anuncio.imagenes.length}`
                        : 'Sube nuevas fotos (opcional)'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Las fotos ayudan a vender más rápido. Máximo 6 imágenes.
                    </p>
                    <Button variant="outline" className="gap-2" onClick={() => document.getElementById('image-upload')?.click()}>
                      <Upload className="h-4 w-4" />
                      Seleccionar fotos
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* Preview de imágenes existentes */}
                  {anuncio?.imagenes && anuncio.imagenes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Imágenes actuales
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {anuncio.imagenes.map((image, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview de nuevas imágenes */}
                  {formData.imagenes && formData.imagenes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Nuevas imágenes
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.imagenes.map((file, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Nueva imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {completedSections.has(4) && currentSection === 4 && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={goToNextSection} className="bg-repsol-orange hover:bg-repsol-orange/90">
                      Continuar
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 5: Ubicación */}
          {completedSections.has(4) && (
            <Card className={`transition-all ${currentSection >= 5 ? 'ring-2 ring-repsol-orange/20 shadow-lg' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completedSections.has(5) 
                      ? 'bg-green-100 text-green-700' 
                      : currentSection === 5 
                        ? 'bg-repsol-orange text-white' 
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {completedSections.has(5) ? <Check className="h-4 w-4" /> : "5"}
                  </div>
                  <CardTitle className="text-gray-900">Ubicación</CardTitle>
                  {completedSections.has(5) && (
                    <Badge className="bg-green-100 text-green-700">Completado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Región */}
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                      Comunidad Autónoma *
                    </Label>
                    <Select value={formData.ubicacion.region} onValueChange={(value) => updateNestedFormData('ubicacion', 'region', value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecciona región" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPANISH_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Provincia */}
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                      Provincia *
                    </Label>
                    <Input
                      id="province"
                      value={formData.ubicacion.province}
                      onChange={(e) => updateNestedFormData('ubicacion', 'province', e.target.value)}
                      placeholder="Ej: Madrid"
                      className="bg-white"
                    />
                  </div>

                  {/* Ciudad */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      Ciudad *
                    </Label>
                    <Input
                      id="city"
                      value={formData.ubicacion.city}
                      onChange={(e) => updateNestedFormData('ubicacion', 'city', e.target.value)}
                      placeholder="Ej: Madrid"
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {completedSections.size > 0 && (
                <>Has completado {completedSections.size} de {totalSections} secciones</>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                disabled={saving}
              >
                Cancelar
              </Button>
              {completedSections.size >= 2 && (
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-repsol-orange hover:bg-repsol-orange/90"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}