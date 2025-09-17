import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Users,
  MessageCircle,
  UserPlus,
  UserX,
  Clock,
  Award,
  TrendingUp,
  Package,
  CheckCircle,
  Heart,
  Share2
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  avatar: string;
  status: "online" | "offline";
  isConnected: boolean;
  mutualConnections: number;
  rating: number;
  specialties: string[];
  joinedDate: string;
  lastActivity: string;
  email?: string;
  phone?: string;
  description?: string;
  experience: number;
  totalTransactions: number;
  verified: boolean;
  achievements: string[];
  recentActivity: Array<{
    id: string;
    type: "post" | "transaction" | "connection";
    description: string;
    date: string;
  }>;
}

// Mock data - in real app this would come from API
const mockUserDetail: UserDetail = {
  id: "1",
  name: "María González",
  restaurant: "La Taberna del Chef",
  location: "Madrid",
  avatar: "/avatars/maria.jpg",
  status: "online",
  isConnected: true,
  mutualConnections: 12,
  rating: 4.8,
  specialties: ["Cocina Mediterránea", "Gestión", "Innovación Culinaria"],
  joinedDate: "Hace 6 meses",
  lastActivity: "Hace 2 horas",
  email: "maria@latabernadelchef.com",
  phone: "+34 600 123 456",
  description: "Chef ejecutiva con más de 15 años de experiencia en cocina mediterránea. Especializada en fusión de sabores tradicionales con técnicas modernas. Apasionada por la sostenibilidad y los productos locales.",
  experience: 15,
  totalTransactions: 47,
  verified: true,
  achievements: ["Top Chef Madrid 2023", "Estrella Verde Michelin", "Mejor Innovación Culinaria"],
  recentActivity: [
    {
      id: "1",
      type: "post",
      description: "Compartió una nueva receta de paella moderna",
      date: "Hace 2 horas"
    },
    {
      id: "2",
      type: "transaction",
      description: "Completó una transacción de equipamiento de cocina",
      date: "Hace 1 día"
    },
    {
      id: "3",
      type: "connection",
      description: "Se conectó con 3 nuevos profesionales",
      date: "Hace 3 días"
    }
  ]
};

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUserDetail);
      setLoading(false);
    }, 500);
  }, [userId]);

  const handleConnect = () => {
    if (user) {
      setUser({ ...user, isConnected: !user.isConnected });
    }
  };


  if (loading) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Usuario no encontrado</h2>
              <Button onClick={() => navigate('/mi-red')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Mi Red
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <motion.div variants={cardVariants}>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi Red
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Avatar and basic info */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${
                      user.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`} />
                    {user.verified && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary border-2 border-white shadow-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleConnect}
                      variant={user.isConnected ? "destructive" : "default"}
                      className="gap-2"
                    >
                      {user.isConnected ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Desconectar
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Conectar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Name and details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{user.name}</h1>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{user.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{user.restaurant}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{user.mutualConnections} conexiones mutuas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Miembro desde {user.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  {user.description && (
                    <p className="text-muted-foreground leading-relaxed">{user.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {user.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex md:flex-col gap-4 md:gap-2">
                  <div className="text-center p-4 bg-secondary/10 rounded-lg border">
                    <div className="font-bold text-2xl text-secondary">{user.experience}</div>
                    <div className="text-xs text-muted-foreground">Años de experiencia</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg border">
                    <div className="font-bold text-2xl text-primary">{user.totalTransactions}</div>
                    <div className="text-xs text-muted-foreground">Transacciones</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg border">
                    <div className="font-bold text-2xl text-secondary">{user.mutualConnections}</div>
                    <div className="text-xs text-muted-foreground">Conexiones</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Información</TabsTrigger>
              <TabsTrigger value="achievements">Logros</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Última actividad: {user.lastActivity}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estadísticas Profesionales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Experiencia</span>
                      <span className="font-semibold">{user.experience} años</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transacciones completadas</span>
                      <span className="font-semibold">{user.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valoración promedio</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{user.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Red de contactos</span>
                      <span className="font-semibold">{user.mutualConnections} conexiones</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Logros y Reconocimientos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {user.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                        <Award className="h-6 w-6" />
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'post' ? 'bg-secondary' :
                          activity.type === 'transaction' ? 'bg-primary' :
                          'bg-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p>{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}
