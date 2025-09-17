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
  AlertTriangle
} from "lucide-react";

interface FormData {
  tipo: 'vendo' | 'busco' | 'oferta' | null;
  categoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  estado_producto: string;
  precio: string;
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
        return !!(formData.estado_producto && (formData.tipo === 'busco' || formData.precio));
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
        tipo: formData.tipo as 'vendo' | 'busco' | 'oferta',
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado_producto: formData.estado_producto,
        precio: formData.precio ? parseFloat(formData.precio) : undefined,
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'vendo', label: 'Vendo', icon: Package, description: 'Algo que ya no necesito' },
                  { id: 'busco', label: 'Busco', icon: MapPin, description: 'Algo que necesito' },
                  { id: 'oferta', label: 'Oferta', icon: DollarSign, description: 'Un servicio' }
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.tipo === option.id 
                        ? 'ring-2 ring-repsol-orange bg-orange-50' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    onClick={() => {
                      updateFormData('tipo', option.id as 'vendo' | 'busco' | 'oferta');
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

          {/* Remaining sections placeholder */}
          {completedSections.has(2) && (
            <Card className="border-dashed border-gray-300">
              <CardContent className="p-6 text-center text-gray-500">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>Secciones 3-5 en desarrollo...</p>
                <p className="text-sm">Detalles • Fotos • Ubicación</p>
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