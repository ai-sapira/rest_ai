import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MapPin,
  UserPlus,
  MessageCircle,
  Phone,
  Mail,
  Star,
  UserCheck,
  UserX,
  Building,
  Clock,
  TrendingUp,
  Send,
  Inbox,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

interface Contact {
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
}

interface Invitation {
  id: string;
  contact: Contact;
  type: "sent" | "received";
  date: string;
  message?: string;
}

const mockMyNetwork: Contact[] = [
  {
    id: "1",
    name: "María González",
    restaurant: "La Taberna del Chef",
    location: "Madrid",
    avatar: "/avatars/maria.jpg",
    status: "online",
    isConnected: true,
    mutualConnections: 12,
    rating: 4.8,
    specialties: ["Cocina Mediterránea", "Gestión"],
    joinedDate: "Hace 6 meses",
    lastActivity: "Hace 2 horas"
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    restaurant: "Mariscos El Puerto",
    location: "Valencia",
    avatar: "/avatars/carlos.jpg",
    status: "offline",
    isConnected: true,
    mutualConnections: 8,
    rating: 4.9,
    specialties: ["Mariscos", "Aprovisionamientos"],
    joinedDate: "Hace 4 meses",
    lastActivity: "Hace 1 día"
  },
  {
    id: "3",
    name: "Ana Martín",
    restaurant: "Bistró Moderno",
    location: "Barcelona",
    avatar: "/avatars/ana.jpg",
    status: "online",
    isConnected: true,
    mutualConnections: 15,
    rating: 4.7,
    specialties: ["Innovación", "Sostenibilidad"],
    joinedDate: "Hace 8 meses",
    lastActivity: "Hace 30 min"
  }
];

const mockSuggestions: Contact[] = [
  {
    id: "4",
    name: "Roberto Silva",
    restaurant: "Pizzería Napoletana",
    location: "Sevilla",
    avatar: "/avatars/roberto.jpg",
    status: "online",
    isConnected: false,
    mutualConnections: 5,
    rating: 4.6,
    specialties: ["Pizza Artesanal", "Masas"],
    joinedDate: "Hace 2 meses",
    lastActivity: "Hace 1 hora"
  },
  {
    id: "5",
    name: "Elena Vega",
    restaurant: "El Jardín Secreto",
    location: "Bilbao",
    avatar: "/avatars/elena.jpg",
    status: "offline",
    isConnected: false,
    mutualConnections: 3,
    rating: 4.8,
    specialties: ["Cocina Vegana", "Productos Locales"],
    joinedDate: "Hace 1 mes",
    lastActivity: "Hace 3 horas"
  },
  {
    id: "6",
    name: "David Fernández",
    restaurant: "Asador La Brasa",
    location: "Madrid",
    avatar: "/avatars/david.jpg",
    status: "online",
    isConnected: false,
    mutualConnections: 7,
    rating: 4.5,
    specialties: ["Carnes", "Parrilla"],
    joinedDate: "Hace 3 semanas",
    lastActivity: "Hace 15 min"
  }
];

const mockInvitations: Invitation[] = [
  {
    id: "inv1",
    contact: {
      id: "7",
      name: "Laura Jiménez",
      restaurant: "Café Central",
      location: "Málaga",
      avatar: "/avatars/laura.jpg",
      status: "online",
      isConnected: false,
      mutualConnections: 2,
      rating: 4.7,
      specialties: ["Café Especializado", "Repostería"],
      joinedDate: "Hace 1 semana",
      lastActivity: "Hace 2 horas"
    },
    type: "sent",
    date: "Hace 2 días",
    message: "Hola Laura, me gustaría conectar contigo para intercambiar experiencias sobre café especializado."
  },
  {
    id: "inv2",
    contact: {
      id: "8",
      name: "Pedro Morales",
      restaurant: "Tapas & Co",
      location: "Granada",
      avatar: "/avatars/pedro.jpg",
      status: "offline",
      isConnected: false,
      mutualConnections: 4,
      rating: 4.4,
      specialties: ["Tapas Tradicionales", "Vinos"],
      joinedDate: "Hace 5 días",
      lastActivity: "Hace 1 día"
    },
    type: "received",
    date: "Hace 1 día",
    message: "Hola, he visto tu perfil y me interesa mucho tu experiencia en gestión de restaurantes."
  },
  {
    id: "inv3",
    contact: {
      id: "9",
      name: "Sofia López",
      restaurant: "Sushi Zen",
      location: "Valencia",
      avatar: "/avatars/sofia.jpg",
      status: "online",
      isConnected: false,
      mutualConnections: 6,
      rating: 4.9,
      specialties: ["Cocina Japonesa", "Sushi"],
      joinedDate: "Hace 3 días",
      lastActivity: "Hace 30 min"
    },
    type: "sent",
    date: "Hace 4 horas",
    message: "Me encantaría conocer más sobre técnicas de preparación de sushi."
  }
];

export default function MiRed() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mi-red");
  const [myNetwork, setMyNetwork] = useState(mockMyNetwork);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [invitations, setInvitations] = useState(mockInvitations);

  const handleConnect = (contactId: string) => {
    setSuggestions(suggestions.map(contact => 
      contact.id === contactId 
        ? { ...contact, isConnected: true }
        : contact
    ));
    
    // Simular agregar a la red
    const connectedContact = suggestions.find(c => c.id === contactId);
    if (connectedContact) {
      setMyNetwork([...myNetwork, { ...connectedContact, isConnected: true }]);
      setSuggestions(suggestions.filter(c => c.id !== contactId));
    }
  };

  const handleDisconnect = (contactId: string) => {
    setMyNetwork(myNetwork.filter(contact => contact.id !== contactId));
  };

  const handleAcceptInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      setMyNetwork([...myNetwork, { ...invitation.contact, isConnected: true }]);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    }
  };

  const handleRejectInvitation = (invitationId: string) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
  };

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
  };

  const handleViewProfile = (contactId: string) => {
    navigate(`/platform/user/${contactId}`);
  };

  const handleFollowUser = (contactId: string) => {
    // This will be implemented when we integrate with real data
    console.log('Follow user:', contactId);
  };

  const filteredNetwork = myNetwork;
  const filteredSuggestions = suggestions;

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          variants={cardVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Red</h1>
            <p className="text-muted-foreground">
              Conecta y colabora con otros profesionales de la hostelería
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mi-red" className="gap-2">
              <Users className="h-4 w-4" />
              Mi Red ({myNetwork.length})
            </TabsTrigger>
            <TabsTrigger value="sugerencias" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sugerencias ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="invitaciones" className="gap-2">
              <Inbox className="h-4 w-4" />
              Invitaciones ({invitations.length})
            </TabsTrigger>
          </TabsList>

          {/* Mi Red Tab */}
          <TabsContent value="mi-red" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filteredNetwork.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewProfile(contact.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              contact.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{contact.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Building className="h-4 w-4" />
                              <span>{contact.restaurant}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{contact.location}</span>
                              <span>•</span>
                              <Users className="h-4 w-4" />
                              <span>{contact.mutualConnections} conexiones mutuas</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {contact.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Última actividad: {contact.lastActivity}</span>
                              </div>
                              <span>Conectado {contact.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(contact.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
              
              {filteredNetwork.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron conexiones</h3>
                    <p className="text-muted-foreground">
                      Prueba a ajustar los filtros o explora nuevas sugerencias
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sugerencias Tab */}
          <TabsContent value="sugerencias" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filteredSuggestions.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewProfile(contact.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              contact.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{contact.rating}</span>
                              </div>
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                Nuevo
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Building className="h-4 w-4" />
                              <span>{contact.restaurant}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{contact.location}</span>
                              <span>•</span>
                              <Users className="h-4 w-4" />
                              <span>{contact.mutualConnections} conexiones mutuas</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {contact.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              Se unió {contact.joinedDate}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(contact.id)}
                            className="gap-2 bg-primary hover:bg-primary/90"
                          >
                            <UserPlus className="h-4 w-4" />
                            Conectar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
              
              {filteredSuggestions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay más sugerencias</h3>
                    <p className="text-muted-foreground">
                      Has visto todas las sugerencias disponibles. Vuelve más tarde para ver nuevos profesionales.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Invitaciones Tab */}
          <TabsContent value="invitaciones" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {/* Filtros de invitaciones */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={invitations.filter(inv => inv.type === "received").length > 0 ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <Inbox className="h-4 w-4" />
                  Recibidas ({invitations.filter(inv => inv.type === "received").length})
                </Button>
                <Button 
                  variant={invitations.filter(inv => inv.type === "sent").length > 0 ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Enviadas ({invitations.filter(inv => inv.type === "sent").length})
                </Button>
              </div>

              {/* Invitaciones recibidas */}
              {invitations.filter(inv => inv.type === "received").length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Inbox className="h-5 w-5" />
                    Invitaciones Recibidas
                  </h3>
                  {invitations.filter(inv => inv.type === "received").map((invitation) => (
                    <Card key={invitation.id} className="hover:shadow-md transition-shadow border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={invitation.contact.avatar} alt={invitation.contact.name} />
                                <AvatarFallback>
                                  {invitation.contact.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                invitation.contact.status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{invitation.contact.name}</h3>
                                <Badge variant="default" className="text-xs">
                                  Nueva invitación
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Building className="h-4 w-4" />
                                <span>{invitation.contact.restaurant}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                <MapPin className="h-4 w-4" />
                                <span>{invitation.contact.location}</span>
                                <span>•</span>
                                <Users className="h-4 w-4" />
                                <span>{invitation.contact.mutualConnections} conexiones mutuas</span>
                              </div>
                              
                              {invitation.message && (
                                <div className="bg-muted p-3 rounded-lg mb-3">
                                  <p className="text-sm">{invitation.message}</p>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground">
                                Invitación enviada {invitation.date}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleAcceptInvitation(invitation.id)}
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Aceptar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRejectInvitation(invitation.id)}
                              className="gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Invitaciones enviadas */}
              {invitations.filter(inv => inv.type === "sent").length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Invitaciones Enviadas
                  </h3>
                  {invitations.filter(inv => inv.type === "sent").map((invitation) => (
                    <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={invitation.contact.avatar} alt={invitation.contact.name} />
                                <AvatarFallback>
                                  {invitation.contact.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                invitation.contact.status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{invitation.contact.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  Pendiente
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Building className="h-4 w-4" />
                                <span>{invitation.contact.restaurant}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                <MapPin className="h-4 w-4" />
                                <span>{invitation.contact.location}</span>
                                <span>•</span>
                                <Users className="h-4 w-4" />
                                <span>{invitation.contact.mutualConnections} conexiones mutuas</span>
                              </div>
                              
                              {invitation.message && (
                                <div className="bg-muted p-3 rounded-lg mb-3">
                                  <p className="text-sm italic">Tu mensaje: "{invitation.message}"</p>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground">
                                Enviada {invitation.date}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {invitations.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay invitaciones</h3>
                    <p className="text-muted-foreground">
                      Cuando envíes o recibas invitaciones de conexión, aparecerán aquí
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}