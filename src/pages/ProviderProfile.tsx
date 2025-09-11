import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProviders } from "@/hooks/useProviders";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  ShoppingBag,
  Calendar,
  Award,
  CheckCircle,
  Users,
  Package,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  ExternalLink,
  Truck
} from "lucide-react";

interface Provider {
  id: string;
  user_id: string;
  name: string;
  cif?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    region: string;
    postal_code: string;
  };
  logo_url?: string;
  verified: boolean;
  verification_date?: string;
  rating: number;
  total_sales: number;
  total_rentals: number;
  specialties: string[];
  service_areas: string[];
  created_at: string;
  updated_at: string;
}

export default function ProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { getProviderById } = useProviders();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("productos");
  const [providerAnuncios, setProviderAnuncios] = useState<any[]>([]);
  const [anunciosLoading, setAnunciosLoading] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const providerData = await getProviderById(providerId);
        setProvider(providerData);
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  // Cargar anuncios del proveedor directamente desde la tabla base para evitar errores 500 de vistas
  useEffect(() => {
    const fetchProviderAnuncios = async () => {
      if (!providerId) return;
      setAnunciosLoading(true);
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('actor_type', 'provider')
          .eq('provider_id', providerId)
          .eq('estado', 'activo')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProviderAnuncios(data || []);
      } catch (err) {
        console.error('Error fetching provider anuncios:', err);
        setProviderAnuncios([]);
      } finally {
        setAnunciosLoading(false);
      }
    };

    fetchProviderAnuncios();
  }, [providerId]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-500 fill-current' 
            : i < rating 
            ? 'text-yellow-500 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="h-64 animate-pulse bg-gray-50" />
              <Card className="h-48 animate-pulse bg-gray-50" />
            </div>
            <div className="space-y-6">
              <Card className="h-32 animate-pulse bg-gray-50" />
              <Card className="h-40 animate-pulse bg-gray-50" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Proveedor no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El proveedor que buscas no existe o no está disponible.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <span>/</span>
          <span>Proveedores</span>
          <span>/</span>
          <span className="text-foreground font-medium">{provider.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={provider.logo_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                      {provider.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{provider.name}</h1>
                      {provider.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(provider.rating)}
                      </div>
                      <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({provider.total_sales + provider.total_rentals} transacciones)
                      </span>
                    </div>

                    {/* Description */}
                    {provider.description && (
                      <p className="text-muted-foreground mb-4">
                        {provider.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {provider.address && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.address.city}, {provider.address.region}</span>
                        </div>
                      )}
                      {provider.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{provider.phone}</span>
                        </div>
                      )}
                      {provider.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={provider.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Visitar web
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="productos">
                  Productos ({providerAnuncios.length})
                </TabsTrigger>
                <TabsTrigger value="sobre">Sobre la empresa</TabsTrigger>
                <TabsTrigger value="valoraciones">Valoraciones</TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="productos" className="space-y-4">
                {!anunciosLoading && providerAnuncios.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {providerAnuncios.map((anuncio) => (
                      <Card 
                        key={anuncio.id} 
                        className="hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/platform/anuncios/${anuncio.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex gap-2">
                                  <Badge variant="outline" className={
                                    anuncio.tipo === 'vendo' ? 'bg-blue-100 text-blue-800' :
                                    anuncio.tipo === 'alquilo' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {anuncio.tipo === 'vendo' ? 'VENTA' :
                                     anuncio.tipo === 'alquilo' ? 'ALQUILER' : 
                                     'SERVICIO'}
                                  </Badge>
                                  {anuncio.estado_producto && (
                                    <Badge variant="secondary" className="text-xs">
                                      {anuncio.estado_producto}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  {anuncio.precio && (
                                    <div className="text-lg font-bold text-primary">
                                      €{parseInt(anuncio.precio).toLocaleString()}
                                    </div>
                                  )}
                                  {anuncio.tipo === 'alquilo' && (
                                    <div className="text-sm text-muted-foreground">
                                      {anuncio.precio_alquiler_dia && `€${anuncio.precio_alquiler_dia}/día`}
                                      {anuncio.precio_alquiler_semana && ` - €${anuncio.precio_alquiler_semana}/sem`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <h3 className="font-semibold mb-1 line-clamp-1">
                                {anuncio.titulo}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {anuncio.descripcion}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{anuncio.subcategoria}</span>
                                {anuncio.envio ? (
                                  <div className="flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    <span>Envío disponible</span>
                                  </div>
                                ) : null}
                                {anuncio.ubicacion?.city && <span>{anuncio.ubicacion.city}</span>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : anunciosLoading ? (
                  <Card>
                    <CardContent className="p-8">
                      <div className="h-6 w-40 bg-gray-100 animate-pulse rounded mb-4" />
                      <div className="grid grid-cols-1 gap-4">
                        <div className="h-28 bg-gray-50 animate-pulse rounded" />
                        <div className="h-28 bg-gray-50 animate-pulse rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Sin productos</h3>
                      <p className="text-muted-foreground">
                        Este proveedor aún no tiene productos publicados
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="sobre" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {provider.cif && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">CIF</h4>
                        <p>{provider.cif}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Especialidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Áreas de servicio</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.service_areas.map((area, index) => (
                          <Badge key={index} variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Miembro desde</h4>
                      <p>{new Date(provider.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long'
                      })}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="valoraciones">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                    <p className="text-muted-foreground">
                      El sistema de valoraciones estará disponible pronto
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ventas totales</span>
                  <span className="font-semibold text-green-600">{provider.total_sales}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alquileres</span>
                  <span className="font-semibold text-blue-600">{provider.total_rentals}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Productos activos</span>
                  <span className="font-semibold">{providerAnuncios.length}</span>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tiempo de respuesta</span>
                  <span className="font-semibold text-green-600">&lt; 2h</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider.phone && (
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    {provider.phone}
                  </Button>
                )}
                
                {provider.email && (
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar email
                  </Button>
                )}
                
                <Button className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensaje
                </Button>
              </CardContent>
            </Card>

            {/* Verification */}
            {provider.verified && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Proveedor Verificado</h4>
                      <p className="text-sm text-green-700">
                        Identidad y documentos verificados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
