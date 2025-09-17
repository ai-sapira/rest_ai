import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { useMisAnuncios } from "@/hooks/useMisAnuncios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  PlusCircle, 
  Eye, 
  MessageSquare, 
  Heart,
  Calendar,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  AlertTriangle,
  BarChart3
} from "lucide-react";

// Using the Anuncio interface from the hook

// Mock data removed - now using real data from database

export default function MisAnuncios() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activos");
  const { misAnuncios, loading, error, changeAnuncioStatus, deleteAnuncio } = useMisAnuncios();

  // Filter anuncios by status
  const anunciosActivos = misAnuncios.filter(anuncio => 
    anuncio.estado === 'activo' || anuncio.estado === 'pausado'
  );
  
  const anunciosPasados = misAnuncios.filter(anuncio => 
    anuncio.estado === 'expirado' || anuncio.estado === 'finalizado'
  );

  // Helper functions matching contratar section style
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'vendo': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'busco': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'oferta': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'vendo': return 'Vendo';
      case 'busco': return 'Busco';
      case 'oferta': return 'Oferto';
      default: return tipo;
    }
  };

  const getConditionColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'nuevo': return 'bg-green-100 text-green-800 border-green-200';
      case 'semi-nuevo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'usado - buen estado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'usado - estado aceptable': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'para reparar': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case "pausado":
        return <Badge variant="secondary">Pausado</Badge>;
      case "expirado":
        return <Badge variant="destructive">Expirado</Badge>;
      case "finalizado":
        return <Badge variant="outline">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Custom AnuncioCard for Mis Anuncios with integrated actions
  const MisAnunciosCard = ({ anuncio }: { anuncio: any }) => {
    const handleCardClick = () => {
      const route = anuncio.categoria === 'servicios' ? 
        `/platform/servicios/${anuncio.id}` : 
        `/platform/anuncios/${anuncio.id}`;
      navigate(route);
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      action();
    };

    return (
      <Card 
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-repsol-orange/40 bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30 rounded-xl overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
              <img 
                src={anuncio.imagenes[0]} 
                alt={anuncio.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-8">
              <img 
                src="/Guia_Repsol.svg" 
                alt="Guía Repsol" 
                className="w-24 h-auto opacity-30"
              />
            </div>
          )}

          {/* Top Row: Type Badge (Left) and Estado Badge (Right) */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <Badge className={`${getTypeColor(anuncio.tipo)} border-0 shadow-lg font-medium text-xs px-2 py-1 whitespace-nowrap`}>
              {getTypeLabel(anuncio.tipo)}
            </Badge>
            <div className="flex-shrink-0">
              {getEstadoBadge(anuncio.estado)}
            </div>
          </div>

          {/* Stats Badge - Bottom center */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 max-w-[calc(100%-1.5rem)]">
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg border border-white/20">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-repsol-blue flex-shrink-0" />
                  <span className="font-medium text-gray-700">{anuncio.visualizaciones || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{anuncio.favoritos || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-repsol-orange flex-shrink-0" />
                  <span className="font-medium text-gray-700">{anuncio.contactos || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Title and Subcategory */}
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-lg leading-tight group-hover:text-repsol-orange transition-colors">
              {anuncio.titulo}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {anuncio.subcategoria && (
                <Badge variant="outline" className="text-repsol-blue border-repsol-blue/30 bg-blue-50 text-xs">
                  {anuncio.subcategoria}
                </Badge>
              )}
              {anuncio.estado_producto && (
                <Badge className={`${getConditionColor(anuncio.estado_producto)} border-0 text-xs`}>
                  {anuncio.estado_producto}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {anuncio.descripcion}
          </p>

          {/* Location and Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-repsol-blue/10 rounded-full">
                <Package className="h-3.5 w-3.5 text-repsol-blue" />
              </div>
              <span className="font-medium text-gray-700 truncate">
                {typeof anuncio.ubicacion === 'string' 
                  ? anuncio.ubicacion 
                  : `${anuncio.ubicacion?.city || ''}, ${anuncio.ubicacion?.region || ''}`
                }
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatDate(anuncio.created_at)}</span>
            </div>
          </div>

          {/* Price and Actions Section */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Price */}
            <div className="flex items-center">
              {anuncio.precio ? (
                <span className="text-2xl font-bold text-repsol-blue">
                  {anuncio.precio}€
                </span>
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {anuncio.tipo === 'busco' ? 'Buscando' : 'Consultar'}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {anuncio.estado === "activo" && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-repsol-orange border-repsol-orange hover:bg-repsol-orange hover:text-white transition-all"
                    onClick={(e) => handleActionClick(e, () => navigate(`/platform/anuncios/${anuncio.id}/editar`))}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                    onClick={(e) => handleActionClick(e, () => navigate(`/platform/anuncios/${anuncio.id}`))}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </>
              )}
              {anuncio.estado === "pausado" && (
                <>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-repsol-orange hover:bg-repsol-orange/90 text-white border-0"
                    onClick={(e) => handleActionClick(e, () => changeAnuncioStatus(anuncio.id, 'activo'))}
                  >
                    Reactivar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-repsol-orange border-repsol-orange hover:bg-repsol-orange hover:text-white"
                    onClick={(e) => handleActionClick(e, () => navigate(`/platform/anuncios/${anuncio.id}/editar`))}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
              {(anuncio.estado === "expirado" || anuncio.estado === "finalizado") && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                    onClick={(e) => handleActionClick(e, handleCardClick)}
                  >
                    Ver detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                    onClick={(e) => handleActionClick(e, () => deleteAnuncio(anuncio.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando tus anuncios...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </main>
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
            <ClipboardList className="h-8 w-8 text-repsol-orange" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Anuncios</h1>
              <p className="text-gray-600 mt-1">Gestiona tus anuncios publicados y revisa su rendimiento</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{misAnuncios.length} anuncios totales</span>
            <span>{anunciosActivos.length} activos</span>
            <span>{anunciosPasados.length} finalizados</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-red-600 mb-2">Error cargando los anuncios: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumen de estadísticas con estilo contratar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Anuncios</CardTitle>
              <ClipboardList className="h-4 w-4 text-repsol-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{misAnuncios.length}</div>
              <p className="text-xs text-gray-500">
                {anunciosActivos.length} activos
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Visualizaciones</CardTitle>
              <Eye className="h-4 w-4 text-repsol-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {misAnuncios.reduce((acc, anuncio) => acc + anuncio.visualizaciones, 0)}
              </div>
              <p className="text-xs text-gray-500">
                Total
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Favoritos</CardTitle>
              <Heart className="h-4 w-4 text-repsol-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {misAnuncios.reduce((acc, anuncio) => acc + (anuncio.favoritos || 0), 0)}
              </div>
              <p className="text-xs text-gray-500">
                Total recibidos
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rendimiento</CardTitle>
              <BarChart3 className="h-4 w-4 text-repsol-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {misAnuncios.length > 0 ? Math.round(misAnuncios.reduce((acc, anuncio) => acc + anuncio.visualizaciones, 0) / misAnuncios.length) : 0}
              </div>
              <p className="text-xs text-gray-500">
                Vistas promedio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs con estilo contratar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger 
              value="activos" 
              className="data-[state=active]:bg-repsol-orange data-[state=active]:text-white"
            >
              Anuncios Activos ({anunciosActivos.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pasados"
              className="data-[state=active]:bg-repsol-orange data-[state=active]:text-white"
            >
              Anuncios Pasados ({anunciosPasados.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-5 w-16 bg-gray-200 rounded" />
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-200 rounded" />
                    </div>
                    <div className="aspect-video bg-gray-200 rounded" />
                    <div className="flex justify-between">
                      <div className="h-3 w-1/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Content */}
          {!loading && (
            <>
              <TabsContent value="activos" className="space-y-4">
                {anunciosActivos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {anunciosActivos.map((anuncio) => (
                      <MisAnunciosCard key={anuncio.id} anuncio={anuncio} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No tienes anuncios activos
                      </h3>
                      <p className="text-gray-600 max-w-sm mb-4">
                        Crea tu primer anuncio para empezar a ofrecer tus productos y servicios
                      </p>
                      <Button 
                        variant="outline" 
                        className="text-repsol-orange border-repsol-orange hover:bg-repsol-orange hover:text-white"
                        onClick={() => navigate('/platform/crear-anuncio')}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crear anuncio
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="pasados" className="space-y-4">
                {anunciosPasados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {anunciosPasados.map((anuncio) => (
                      <MisAnunciosCard key={anuncio.id} anuncio={anuncio} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay anuncios pasados
                      </h3>
                      <p className="text-gray-600 max-w-sm">
                        Aquí aparecerán tus anuncios finalizados o expirados
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </motion.main>
  );
}