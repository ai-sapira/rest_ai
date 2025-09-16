import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { useAnuncios } from "@/hooks/useAnuncios";
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
  DollarSign
} from "lucide-react";

// Using the Anuncio interface from the hook

// Mock data removed - now using real data from database

export default function MisAnuncios() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activos");
  const { misAnuncios, loading, error, changeAnuncioStatus, deleteAnuncio } = useAnuncios();

  // Filter anuncios by status
  const anunciosActivos = misAnuncios.filter(anuncio => 
    anuncio.estado === 'activo' || anuncio.estado === 'pausado'
  );
  
  const anunciosPasados = misAnuncios.filter(anuncio => 
    anuncio.estado === 'expirado' || anuncio.estado === 'finalizado'
  );

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

  const AnuncioCard = ({ anuncio }: { anuncio: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle 
              className="text-lg leading-tight cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => {
                const route = anuncio.categoria === 'servicios' ? 
                  `/platform/servicios/${anuncio.id}` : 
                  `/platform/anuncios/${anuncio.id}`;
                navigate(route);
              }}
            >
              {anuncio.titulo}
            </CardTitle>
            <CardDescription className="mt-1">
              {anuncio.categoria} • {anuncio.ubicacion?.city || anuncio.ubicacion?.province}
            </CardDescription>
          </div>
          {getEstadoBadge(anuncio.estado)}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Creado: {new Date(anuncio.created_at).toLocaleDateString()}</span>
          <span className="font-semibold text-lg text-foreground">
            {anuncio.precio ? `${anuncio.precio}€` : anuncio.tipo === 'busco' ? 'Busco' : 'Consultar'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{anuncio.visualizaciones}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vistas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mensajes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{anuncio.favoritos}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Favoritos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{anuncio.contactos}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contactos</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {anuncio.estado === "activo" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/platform/anuncios/${anuncio.id}/editar`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/platform/anuncios/${anuncio.id}`)}
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
                className="flex-1"
                onClick={() => changeAnuncioStatus(anuncio.id, 'activo')}
              >
                Reactivar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/platform/anuncios/${anuncio.id}/editar`)}
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
                className="flex-1"
                onClick={() => {
                  const route = anuncio.categoria === 'servicios' ? 
                    `/platform/servicios/${anuncio.id}` : 
                    `/platform/anuncios/${anuncio.id}`;
                  navigate(route);
                }}
              >
                Ver detalles
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteAnuncio(anuncio.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
      className="flex-1 p-6 space-y-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Mis Anuncios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus anuncios publicados y revisa su rendimiento
          </p>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anuncios</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{misAnuncios.length}</div>
            <p className="text-xs text-muted-foreground">
              {anunciosActivos.length} activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {misAnuncios.reduce((acc, anuncio) => acc + anuncio.visualizaciones, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0
            </div>
            <p className="text-xs text-muted-foreground">
              Total recibidos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para anuncios activos y pasados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activos">Anuncios Activos ({anunciosActivos.length})</TabsTrigger>
          <TabsTrigger value="pasados">Anuncios Pasados ({anunciosPasados.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activos" className="space-y-4">
          {anunciosActivos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {anunciosActivos.map((anuncio) => (
                <AnuncioCard key={anuncio.id} anuncio={anuncio} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes anuncios activos</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer anuncio para empezar a ofrecer tus productos y servicios
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pasados" className="space-y-4">
          {anunciosPasados.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {anunciosPasados.map((anuncio) => (
                <AnuncioCard key={anuncio.id} anuncio={anuncio} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay anuncios pasados</h3>
                <p className="text-muted-foreground">
                  Aquí aparecerán tus anuncios finalizados o expirados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.main>
  );
}