import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigationTransition, pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAnuncio, useAnunciosSimple, type Anuncio } from "@/hooks/useAnunciosSimple";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionsSimple } from "@/hooks/useTransactionsSimple";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Star,
  Truck,
  Shield,
  Calendar,
  Euro,
  Ruler,
  Package,
  Mail,
  ShoppingCart,
  Edit,
  Trash2
} from "lucide-react";
import { PurchaseModal } from "@/components/PurchaseModal";
import { OfferModal } from "@/components/OfferModal";

export default function AnuncioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navigateWithDelay } = useNavigationTransition();
  
  // ✅ SINGLE SOURCE OF TRUTH - Use only hook loading state
  const { anuncio, loading, error } = useAnuncio(id!);
  const { incrementViews, deleteAnuncio, isDeletingAnuncio } = useAnunciosSimple();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // ✅ SEPARATE CONCERNS - Only UI-specific states
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // ✅ SIDE EFFECTS - Increment views when anuncio loads successfully
  useEffect(() => {
    if (id && anuncio && !loading) {
      incrementViews(id);
    }
  }, [id, anuncio, loading, incrementViews]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vendo":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "busco":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "oferta":
        return "bg-green-100 text-green-800 border-green-200";
      case "busco_servicio":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "pausado":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "finalizado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteAnuncio = async () => {
    if (!anuncio?.id) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
      const success = await deleteAnuncio(anuncio.id);
      
      if (success) {
        toast({
          title: "Anuncio eliminado",
          description: "Tu anuncio ha sido eliminado exitosamente.",
        });
        navigate('/platform/mis-anuncios');
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el anuncio. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  // ✅ PROPER LOADING STATE - Use hook loading
  if (loading) {
    return (
      <motion.main 
        className="flex-1 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          </div>
          
          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="h-96 animate-pulse" />
              <Card className="h-64 animate-pulse" />
            </div>
            <div className="space-y-6">
              <Card className="h-80 animate-pulse" />
              <Card className="h-48 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.main>
    );
  }

  // ✅ ERROR HANDLING - Show error state if query failed
  if (error) {
    return (
      <motion.main 
        className="flex-1 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error al cargar el anuncio</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.main>
    );
  }

  // ✅ NOT FOUND STATE - Only after loading completed
  if (!loading && !anuncio) {
    return (
      <motion.main 
        className="flex-1 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Anuncio no encontrado</h3>
              <p className="text-muted-foreground mb-4">
                El anuncio que buscas no existe o ha sido eliminado.
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                Volver atrás
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">{anuncio.titulo}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Guardado' : 'Guardar'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg flex items-center justify-center">
                  {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
                    <img 
                      src={anuncio.imagenes[0]} 
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center p-12">
                      <img 
                        src="/Guia_Repsol.svg" 
                        alt="Guía Repsol" 
                        className="w-32 h-auto opacity-30"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(anuncio.tipo)}>
                    {anuncio.tipo.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(anuncio.estado)}>
                    {anuncio.estado.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {anuncio.descripcion}
                  </p>
                </div>

                {/* Service-specific fields */}
                {anuncio.categoria === 'servicios' && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-4">
                      {anuncio.experiencia_anos && (
                        <div>
                          <h4 className="font-medium mb-1">Experiencia</h4>
                          <p className="text-sm text-muted-foreground">
                            {anuncio.experiencia_anos} años
                          </p>
                        </div>
                      )}
                      {anuncio.disponibilidad && (
                        <div>
                          <h4 className="font-medium mb-1">Disponibilidad</h4>
                          <p className="text-sm text-muted-foreground">
                            {anuncio.disponibilidad}
                          </p>
                        </div>
                      )}
                      {anuncio.especialidades && anuncio.especialidades.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">Especialidades</h4>
                          <div className="flex flex-wrap gap-2">
                            {anuncio.especialidades.map((esp, index) => (
                              <Badge key={index} variant="secondary">
                                {esp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {anuncio.idiomas && anuncio.idiomas.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">Idiomas</h4>
                          <div className="flex flex-wrap gap-2">
                            {anuncio.idiomas.map((idioma, index) => (
                              <Badge key={index} variant="outline">
                                {idioma}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product details */}
                {anuncio.categoria !== 'servicios' && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-4">
                      {anuncio.estado_producto && (
                        <div>
                          <h4 className="font-medium mb-1">Estado</h4>
                          <p className="text-sm text-muted-foreground">
                            {anuncio.estado_producto}
                          </p>
                        </div>
                      )}
                      {anuncio.dimensiones && Object.keys(anuncio.dimensiones).length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Dimensiones</h4>
                          <p className="text-sm text-muted-foreground">
                            {anuncio.dimensiones.width && `${anuncio.dimensiones.width}cm`}
                            {anuncio.dimensiones.height && ` × ${anuncio.dimensiones.height}cm`}
                            {anuncio.dimensiones.depth && ` × ${anuncio.dimensiones.depth}cm`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info for Services */}
            {anuncio.categoria === 'servicios' && (anuncio.referencias || anuncio.portfolio) && (
              <Card>
                <CardHeader>
                  <CardTitle>Información adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {anuncio.referencias && (
                    <div>
                      <h4 className="font-medium mb-2">Referencias</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {anuncio.referencias}
                      </p>
                    </div>
                  )}
                  {anuncio.portfolio && (
                    <div>
                      <h4 className="font-medium mb-2">Portfolio</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {anuncio.portfolio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Price & Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Precio</span>
                  <div className="text-right">
                    {anuncio.tipo === 'alquilo' ? (
                      <div>
                        {anuncio.precio_alquiler_dia && (
                          <div className="text-2xl font-bold text-primary">
                            €{parseInt(anuncio.precio_alquiler_dia).toLocaleString()}/día
                          </div>
                        )}
                        {anuncio.precio_alquiler_semana && (
                          <div className="text-lg font-semibold text-muted-foreground">
                            €{parseInt(anuncio.precio_alquiler_semana).toLocaleString()}/semana
                          </div>
                        )}
                        {anuncio.precio_alquiler_mes && (
                          <div className="text-lg font-semibold text-muted-foreground">
                            €{parseInt(anuncio.precio_alquiler_mes).toLocaleString()}/mes
                          </div>
                        )}
                      </div>
                    ) : anuncio.tipo === 'busco_alquiler' ? (
                      anuncio.precio_alquiler_mes && (
                        <div className="text-2xl font-bold text-primary">
                          Hasta €{parseInt(anuncio.precio_alquiler_mes).toLocaleString()}/mes
                        </div>
                      )
                    ) : anuncio.precio ? (
                      <span className="text-2xl font-bold text-primary">
                        €{parseInt(anuncio.precio).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">
                        Consultar precio
                      </span>
                    )}
                  </div>
                </CardTitle>
                {anuncio.categoria === 'servicios' && anuncio.salario_min && anuncio.salario_max && (
                  <p className="text-sm text-muted-foreground">
                    Rango: €{parseInt(anuncio.salario_min).toLocaleString()} - €{parseInt(anuncio.salario_max).toLocaleString()}
                    {anuncio.tipo_salario && ` / ${anuncio.tipo_salario}`}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {user && user.id === anuncio.user_id ? (
                  /* Own Announcement - Management Buttons */
                  <>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <p className="text-sm font-medium text-blue-900">Este es tu anuncio</p>
                      <p className="text-xs text-blue-700">Gestiona tu publicación desde aquí</p>
                    </div>
                    
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={() => navigate(`/platform/anuncios/${anuncio.id}/editar`)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar anuncio
                    </Button>
                    
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDeleteAnuncio}
                      disabled={isDeletingAnuncio}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeletingAnuncio ? 'Eliminando...' : 'Eliminar anuncio'}
                    </Button>
                  </>
                ) : user ? (
                  /* Other User's Announcement - Purchase/Contact Buttons */
                  <>
                    {anuncio.categoria !== 'servicios' && anuncio.precio && (
                      <>
                        <Button 
                          className="w-full gap-2" 
                          size="lg"
                          onClick={() => setShowPurchaseModal(true)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar ahora
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => setShowOfferModal(true)}
                        >
                          <Euro className="h-4 w-4" />
                          Hacer una oferta
                        </Button>
                        <Separator />
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => navigate('/platform/mensajes', {
                        state: {
                          chatType: 'contact',
                          anuncioId: anuncio.id,
                          ownerId: anuncio.user_id,
                          anuncioTitle: anuncio.titulo
                        }
                      })}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contactar vendedor
                    </Button>
                    
                  </>
                ) : (
                  /* Not Logged In - Login Prompt */
                  <>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                      <p className="text-sm font-medium text-gray-900">Inicia sesión para contactar</p>
                      <p className="text-xs text-gray-600">Necesitas una cuenta para comprar o contactar al vendedor</p>
                    </div>
                    
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Iniciar sesión
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Location & Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicación y detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 break-words">{anuncio.ubicacion.city}</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {anuncio.ubicacion.province}, {anuncio.ubicacion.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Publicado</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(anuncio.created_at)}
                    </p>
                  </div>
                </div>

                {anuncio.envio && (
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <p className="text-sm">Envío disponible</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{anuncio.visualizaciones}</p>
                    <p className="text-xs text-muted-foreground">Vistas</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{anuncio.contactos}</p>
                    <p className="text-xs text-muted-foreground">Contactos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Consejos de seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Verifica la identidad del vendedor/comprador
                </p>
                <p className="text-sm text-muted-foreground">
                  • Realiza transacciones en lugares seguros
                </p>
                <p className="text-sm text-muted-foreground">
                  • No compartas información personal sensible
                </p>
                <p className="text-sm text-muted-foreground">
                  • Desconfía de precios demasiado bajos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {anuncio && (
        <>
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            anuncio={anuncio}
          />
          
          <OfferModal
            isOpen={showOfferModal}
            onClose={() => setShowOfferModal(false)}
            anuncio={anuncio}
          />
        </>
      )}
    </motion.main>
  );
}