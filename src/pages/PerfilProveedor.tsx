import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProviders } from "@/hooks/useProviders";
import { useAnuncios } from "@/hooks/useAnuncios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  Edit,
  Plus,
  Package,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  FileText,
  Calendar
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

export default function PerfilProveedor() {
  const { user } = useAuth();
  const { 
    fetchProviders, 
    createProvider, 
    updateProvider, 
    getProviderByUserId 
  } = useProviders();
  const { anuncios, refetchAnuncios } = useAnuncios();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    cif: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      province: '',
      region: '',
      postal_code: ''
    },
    specialties: [] as string[],
    service_areas: [] as string[]
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');

  useEffect(() => {
    const loadProvider = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const existingProvider = await getProviderByUserId(user.id);
        if (existingProvider) {
          setProvider(existingProvider);
          setFormData({
            name: existingProvider.name,
            cif: existingProvider.cif || '',
            description: existingProvider.description || '',
            website: existingProvider.website || '',
            phone: existingProvider.phone || '',
            email: existingProvider.email || '',
            address: existingProvider.address || {
              street: '',
              city: '',
              province: '',
              region: '',
              postal_code: ''
            },
            specialties: existingProvider.specialties || [],
            service_areas: existingProvider.service_areas || []
          });
        }
      } catch (error) {
        console.error('Error loading provider:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProvider();
  }, [user, getProviderByUserId]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (provider) {
        // Update existing provider
        await updateProvider(provider.id, formData);
        setProvider({ ...provider, ...formData });
      } else {
        // Create new provider
        const newProvider = await createProvider({
          user_id: user.id,
          ...formData
        });
        setProvider(newProvider);
      }
      setEditing(false);
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.service_areas.includes(newServiceArea.trim())) {
      setFormData(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter(a => a !== area)
    }));
  };

  // Filter anuncios by this provider
  const providerAnuncios = anuncios.filter(anuncio => 
    anuncio.actor_type === 'provider' && anuncio.provider_id === provider?.id
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="h-64 animate-pulse bg-gray-50" />
            </div>
            <div className="space-y-6">
              <Card className="h-32 animate-pulse bg-gray-50" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              {provider ? 'Mi Perfil de Proveedor' : 'Crear Perfil de Proveedor'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {provider 
                ? 'Gestiona tu perfil y productos como proveedor profesional'
                : 'Completa tu perfil para empezar a vender como proveedor'
              }
            </p>
          </div>
          
          {provider && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="productos">Productos ({providerAnuncios.length})</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                <TabsTrigger value="configuracion">Configuración</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="perfil" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Información básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre de la empresa *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editing && !!provider}
                          placeholder="Ej: Equipamientos Hostelería Madrid S.L."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cif">CIF</Label>
                        <Input
                          id="cif"
                          value={formData.cif}
                          onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                          disabled={!editing && !!provider}
                          placeholder="A12345678"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        disabled={!editing && !!provider}
                        placeholder="Describe tu empresa y servicios..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Sitio web</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!editing && !!provider}
                          placeholder="https://www.miempresa.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!editing && !!provider}
                          placeholder="+34 600 123 456"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email de contacto</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editing && !!provider}
                        placeholder="contacto@miempresa.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Dirección
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Calle</Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          disabled={!editing && !!provider}
                          placeholder="Calle Mayor, 123"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="postal_code">Código postal</Label>
                        <Input
                          id="postal_code"
                          value={formData.address.postal_code}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, postal_code: e.target.value }
                          }))}
                          disabled={!editing && !!provider}
                          placeholder="28001"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          disabled={!editing && !!provider}
                          placeholder="Madrid"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="province">Provincia</Label>
                        <Input
                          id="province"
                          value={formData.address.province}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, province: e.target.value }
                          }))}
                          disabled={!editing && !!provider}
                          placeholder="Madrid"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="region">Comunidad</Label>
                        <Input
                          id="region"
                          value={formData.address.region}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, region: e.target.value }
                          }))}
                          disabled={!editing && !!provider}
                          placeholder="Comunidad de Madrid"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Especialidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        disabled={!editing && !!provider}
                        placeholder="Añadir especialidad..."
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      />
                      <Button 
                        onClick={addSpecialty} 
                        disabled={!editing && !!provider}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {specialty}
                          {editing && (
                            <button
                              onClick={() => removeSpecialty(specialty)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Áreas de servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newServiceArea}
                        onChange={(e) => setNewServiceArea(e.target.value)}
                        disabled={!editing && !!provider}
                        placeholder="Añadir área de servicio..."
                        onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
                      />
                      <Button 
                        onClick={addServiceArea} 
                        disabled={!editing && !!provider}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.service_areas.map((area, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {area}
                          {editing && (
                            <button
                              onClick={() => removeServiceArea(area)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="productos" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mis productos</h3>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo producto
                  </Button>
                </div>
                
                {providerAnuncios.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {providerAnuncios.map((anuncio) => (
                      <Card key={anuncio.id} className="hover:shadow-md transition-all">
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
                                <span>{anuncio.ubicacion.city}</span>
                                <span>{new Date(anuncio.created_at).toLocaleDateString('es-ES')}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Sin productos</h3>
                      <p className="text-muted-foreground mb-4">
                        Aún no has publicado ningún producto
                      </p>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Crear primer producto
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="estadisticas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Ventas totales</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {provider?.total_sales || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Alquileres</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {provider?.total_rentals || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">Productos activos</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {providerAnuncios.length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium">Valoración</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {provider?.rating?.toFixed(1) || 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuracion">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuración
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificaciones de nuevos mensajes</h4>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones cuando alguien te contacte
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Perfil público visible</h4>
                        <p className="text-sm text-muted-foreground">
                          Tu perfil será visible para otros usuarios
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Verificación de empresa</h4>
                        <p className="text-sm text-muted-foreground">
                          {provider?.verified 
                            ? 'Tu empresa está verificada' 
                            : 'Solicitar verificación de empresa'
                          }
                        </p>
                      </div>
                      {provider?.verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Solicitar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estado del perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {provider ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    {provider ? 'Perfil activo' : 'Perfil pendiente'}
                  </span>
                </div>
                
                {provider && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Información básica</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Especialidades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Áreas de servicio</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo producto
                </Button>
                
                <Button variant="outline" className="w-full gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Ver estadísticas
                </Button>
                
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Verification Status */}
            {provider && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      provider.verified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {provider.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        provider.verified ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {provider.verified ? 'Empresa Verificada' : 'Pendiente de Verificación'}
                      </h4>
                      <p className={`text-sm ${
                        provider.verified ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {provider.verified 
                          ? 'Tu identidad está verificada' 
                          : 'Completa la verificación para mayor confianza'
                        }
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