import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  MessageCircle,
  Eye,
  User,
  Clock,
  Euro,
  Award,
  Languages,
  ChefHat,
  Coffee,
  Wine,
  Utensils,
  UserCheck,
  Shirt,
  Star,
  Building2,
  FileText
} from "lucide-react";
import { useAnuncios, type Anuncio } from "@/hooks/useAnuncios";
import { useAuth } from "@/hooks/useAuth";

// Icon mapping for subcategories
const SUBCATEGORY_ICONS: { [key: string]: any } = {
  'Chef / Cocinero': ChefHat,
  'Camarero / Mesero': Utensils,
  'Barista': Coffee,
  'Sommelier': Wine,
  'Ayudante de Cocina': UserCheck,
  'Personal de Limpieza': Shirt
};

export default function ServicioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incrementViews } = useAnuncios();
  
  const [servicio, setServicio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    let timeoutId: number;

    const fetchServicio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set a reasonable timeout
        timeoutId = window.setTimeout(() => {
          setError('Error de conexión - tiempo agotado');
          setLoading(false);
        }, 15000);
        
        const { supabase } = await import('@/lib/supabase');
        
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('id', id)
          .eq('categoria', 'servicios')
          .single();

        // Clear timeout if we got a response
        window.clearTimeout(timeoutId);

        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Servicio no encontrado');
        }
        
        setServicio(data);
        
        // Increment views (only if not the owner and user is logged in)
        if (data && user && user.id !== data.user_id) {
          try {
            await incrementViews(id);
          } catch (err) {
            console.warn('Failed to increment views:', err);
          }
        }
      } catch (err) {
        window.clearTimeout(timeoutId);
        console.error('Error fetching servicio:', err);
        setError(err instanceof Error ? err.message : 'Error loading servicio');
      } finally {
        setLoading(false);
      }
    };

    fetchServicio();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [id, user?.id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: servicio?.titulo,
        text: servicio?.descripcion,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast
    }
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log('Contact professional');
  };

  const isOwner = user?.id === servicio?.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || 'Servicio no encontrado'}</p>
          <Button onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    const min = servicio.salario_min;
    const max = servicio.salario_max;
    const type = servicio.tipo_salario;
    
    if (!min && !max) return 'A negociar';
    
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
      }).format(amount);
    };
    
    const typeLabel = {
      'hora': '/hora',
      'dia': '/día',
      'mes': '/mes',
      'año': '/año',
      'proyecto': '/proyecto'
    }[type || 'hora'];
    
    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)}${typeLabel}`;
    } else if (min) {
      return `Desde ${formatAmount(min)}${typeLabel}`;
    } else {
      return `Hasta ${formatAmount(max!)}${typeLabel}`;
    }
  };

  const getTipoLabel = () => {
    if (servicio.tipo === 'oferta') {
      return { label: 'Disponible', color: 'bg-green-500' };
    } else if (servicio.tipo === 'busco') {
      return { label: 'Buscando', color: 'bg-blue-500' };
    } else {
      return { label: servicio.tipo, color: 'bg-gray-500' };
    }
  };

  const formatSchedule = () => {
    if (!servicio.disponibilidad_horario) return null;
    
    const schedule = servicio.disponibilidad_horario;
    const days = [
      { key: 'lunes', label: 'Lun' },
      { key: 'martes', label: 'Mar' },
      { key: 'miercoles', label: 'Mié' },
      { key: 'jueves', label: 'Jue' },
      { key: 'viernes', label: 'Vie' },
      { key: 'sabado', label: 'Sáb' },
      { key: 'domingo', label: 'Dom' }
    ];
    
    return days.filter(day => schedule[day.key]).map(day => ({
      day: day.label,
      hours: schedule[day.key]
    }));
  };

  const tipoInfo = getTipoLabel();
  const SubcategoryIcon = SUBCATEGORY_ICONS[servicio.subcategoria] || UserCheck;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={isFavorite ? "text-red-500 border-red-200" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {isOwner && (
                <Button
                  onClick={() => navigate(`/platform/anuncios/${id}/editar`)}
                  size="sm"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile & Info */}
          <div className="lg:col-span-2">
            {/* Professional Profile */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <SubcategoryIcon className="h-20 w-20 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">{servicio.subcategoria}</p>
                    <p className="text-sm opacity-80">Perfil Profesional</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Descripción profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{servicio.descripcion}</p>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalles profesionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Especialidad</h4>
                    <p className="text-gray-600">{servicio.subcategoria}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Experiencia</h4>
                    <p className="text-gray-600">{servicio.experiencia_anos} años</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Disponibilidad</h4>
                    <p className="text-gray-600">{servicio.disponibilidad}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tarifa</h4>
                    <p className="text-green-600 font-semibold">{formatSalary()}</p>
                  </div>
                </div>

                {/* Specialties */}
                {servicio.especialidades && servicio.especialidades.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Especialidades
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {servicio.especialidades.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {servicio.idiomas && servicio.idiomas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Idiomas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {servicio.idiomas.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {servicio.certificaciones && servicio.certificaciones.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Certificaciones
                    </h4>
                    <div className="space-y-1">
                      {servicio.certificaciones.map((cert) => (
                        <div key={cert} className="flex items-center gap-2">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {formatSchedule() && formatSchedule()!.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horarios disponibles
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {formatSchedule()!.map((item) => (
                        <div key={item.day} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{item.day}:</span>
                          <span className="text-gray-600">{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            {servicio.portfolio && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Portfolio y trabajos destacados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{servicio.portfolio}</p>
                </CardContent>
              </Card>
            )}

            {/* References */}
            {servicio.referencias && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Referencias y experiencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{servicio.referencias}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Info */}
          <div>
            {/* Price & Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Type Badge */}
                  <Badge className={`${tipoInfo.color} text-white`}>
                    {tipoInfo.label}
                  </Badge>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-gray-900">{servicio.titulo}</h1>

                  {/* Salary */}
                  <div className="text-3xl font-bold text-green-600">
                    {formatSalary()}
                  </div>

                  {/* Experience & Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{servicio.experiencia_anos} años de experiencia</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{servicio.disponibilidad}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {servicio.ubicacion?.city}, {servicio.ubicacion?.region}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Publicado el {new Date(servicio.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{servicio.visualizaciones} vistas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{servicio.favoritos} favoritos</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwner && (
                    <div className="space-y-3 pt-4">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleContact}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contactar profesional
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleFavorite}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                        {isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      </Button>
                    </div>
                  )}

                  {isOwner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Tu perfil profesional</span>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">
                        Este es tu perfil profesional. Puedes editarlo o ver sus estadísticas.
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/platform/anuncios/${id}/editar`)}
                        >
                          Editar perfil
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Rating Card */}
            {!isOwner && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información profesional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Valoración</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-gray-500 text-sm">(12 reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tiempo de respuesta</span>
                    <span className="font-semibold text-green-600">~2 horas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trabajos completados</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tasa de éxito</span>
                    <span className="font-semibold text-green-600">98%</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}