import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { AppSidebar } from "@/components/AppSidebar";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Login from "./Login";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Community from "./Community";
import Profile from "./Profile";
import MiRed from "./MiRed";
import MisThreads from "./MisThreads";
import Categorias from "./Categorias";
import Maquinaria from "./Maquinaria";
import Mobiliario from "./Mobiliario";
import Utensilios from "./Utensilios";
import Menaje from "./Menaje";
import Bodega from "./Bodega";
import Aprovisionamientos from "./Aprovisionamientos";
import MisAnuncios from "./MisAnuncios";
import Transacciones from "./Transacciones";
import Mensajes from "./Mensajes";
import MisComunidades from "./MisComunidades";
import Soporte from "./Soporte";
import Ajustes from "./Ajustes";
import PostDetail from "./PostDetail";
import CrearAnuncio from "./CrearAnuncio";
import AnuncioDetail from "./AnuncioDetail";
import AnuncioEdit from "./AnuncioEdit";
import Servicios from "./Servicios";
import ServicioDetail from "./ServicioDetail";
import Explorar from "./Explorar";
import CommunityDetail from "./CommunityDetail";
import { CreateCommunityForm } from "@/components/CreateCommunityForm";
import { useCommunities } from "@/hooks/useCommunities";

import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  MessageSquare,
  Star,
  Clock,
  ChevronRight
} from "lucide-react";

function Dashboard() {
  const stats = [
    {
      title: "Pedidos este mes",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: ShoppingCart
    },
    {
      title: "Ahorro total",
      value: "€3,240",
      change: "+8%",
      changeType: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Proveedores activos",
      value: "12",
      change: "+2",
      changeType: "positive" as const,
      icon: Users
    },
    {
      title: "Mensajes pendientes",
      value: "5",
      change: "2 nuevos",
      changeType: "neutral" as const,
      icon: MessageSquare
    }
  ];

  const recentActivity = [
    {
      title: "Nuevo pedido confirmado",
      description: "Equipamiento de cocina - Proveedor HostelPro",
      time: "hace 2 horas",
      type: "order"
    },
    {
      title: "Mensaje de proveedor",
      description: "Respuesta sobre disponibilidad de productos",
      time: "hace 4 horas", 
      type: "message"
    },
    {
      title: "Oferta especial disponible",
      description: "20% descuento en menaje profesional",
      time: "hace 6 horas",
      type: "offer"
    }
  ];

  const recommendedSuppliers = [
    {
      name: "ChefEquip Pro",
      category: "Equipamiento de Cocina",
      rating: 4.8,
      orders: 156,
      discount: "15% desc."
    },
    {
      name: "Ingredientes Frescos SL",
      category: "Aprovisionamientos",
      rating: 4.9,
      orders: 89,
      discount: "Envío gratis"
    },
    {
      name: "Mobiliario Hostel",
      category: "Mobiliario y Decoración",
      rating: 4.7,
      orders: 67,
      discount: "10% desc."
    }
  ];

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            ¡Bienvenido, Juan! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes un resumen de tu actividad en la plataforma
          </p>
        </div>
        <Button variant="default" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Hacer nuevo pedido
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                <Badge 
                  variant={stat.changeType === "positive" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground ml-2">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas actualizaciones de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full justify-between">
              Ver toda la actividad
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recommended Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Proveedores Recomendados
            </CardTitle>
            <CardDescription>
              Basado en tu historial y preferencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedSuppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{supplier.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {supplier.discount}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{supplier.category}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{supplier.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {supplier.orders} pedidos
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver catálogo
                </Button>
              </div>
            ))}
            <Button variant="ghost" className="w-full justify-between">
              Explorar más proveedores
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span>Nuevo Pedido</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Explorar Comunidad</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Mensajes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function Platform() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recientes");
  const { user, loading } = useAuth();
  const { refetchAll, refetchMine } = useCommunities();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreatePost = () => {
    // Check if we're in a contratar section
    const isContratarSection = location.pathname.includes('/contratar/') || 
                              location.pathname.includes('/buscar') || 
                              location.pathname.includes('/mis-anuncios') || 
                              location.pathname.includes('/transacciones');
    
    if (isContratarSection) {
      // Navigate to crear anuncio page
      navigate('/platform/crear-anuncio');
    } else {
      setIsCreatePostModalOpen(true);
    }
  };

  const handleCreateCommunity = () => {
    console.log('handleCreateCommunity llamado desde Platform.tsx');
    setIsCreateCommunityModalOpen(true);
  };

  const handleCommunityCreated = () => {
    // Refresh communities data after creating a new one
    refetchAll();
    refetchMine();
  };

  // Reset activeTab to "recientes" when navigating to /comunidad from sidebar
  useEffect(() => {
    if (location.pathname === '/platform/comunidad') {
      console.log('Navigated to /comunidad, resetting activeTab to recientes');
      setActiveTab("recientes");
    }
  }, [location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Navbar at the top - FULL WIDTH */}
      <PlatformNavbar 
        onCreatePost={handleCreatePost}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        <AppSidebar onCreateCommunity={handleCreateCommunity} />
        <main className="flex-1 min-w-0 bg-background ml-60 pt-14">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/comunidad" 
              element={
                <Community 
                  isCreatePostModalOpen={isCreatePostModalOpen}
                  setIsCreatePostModalOpen={setIsCreatePostModalOpen}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              } 
            />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/comunidades/:slug" element={<CommunityDetail />} />
            <Route path="/mis-threads" element={<MisThreads />} />
            <Route path="/mi-red" element={<MiRed />} />
            <Route path="/buscar" element={<Categorias />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/contratar/maquinaria" element={<Maquinaria />} />
            <Route path="/contratar/mobiliario" element={<Mobiliario />} />
            <Route path="/contratar/utensilios" element={<Utensilios />} />
            <Route path="/contratar/menaje" element={<Menaje />} />
            <Route path="/contratar/bodega" element={<Bodega />} />
            <Route path="/contratar/aprovisionamientos" element={<Aprovisionamientos />} />
            <Route path="/contratar/servicios" element={<Servicios />} />
            <Route path="/mis-anuncios" element={<MisAnuncios />} />
            <Route path="/transacciones" element={<Transacciones />} />
            <Route path="/mensajes" element={<Mensajes />} />
            <Route path="/mis-comunidades" element={<MisComunidades />} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/crear-anuncio" element={<CrearAnuncio />} />
            <Route path="/anuncios/:id" element={<AnuncioDetail />} />
            <Route path="/anuncios/:id/editar" element={<AnuncioEdit />} />
            <Route path="/servicios/:id" element={<ServicioDetail />} />
            
            <Route path="/perfil" element={<Profile />} />
            <Route path="/*" element={<Dashboard />} />
            </Routes>
        </main>
      </div>

      {/* Global Create Community Modal */}
      <CreateCommunityForm
        isOpen={isCreateCommunityModalOpen}
        onClose={() => {
          console.log('Cerrando modal crear comunidad desde Platform.tsx');
          setIsCreateCommunityModalOpen(false);
        }}
        onSuccess={handleCommunityCreated}
      />
    </div>
  );
}