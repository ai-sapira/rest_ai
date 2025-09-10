import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useAnuncios } from "@/hooks/useAnuncios";
import { WorkExperienceForm } from "@/components/WorkExperienceForm";
import { EducationForm } from "@/components/EducationForm";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  GraduationCap,
  Award,
  Edit,
  Plus,
  Verified,
  ShoppingCart,
  Package,
  Settings,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Eye,
  Heart,
  Euro,
  TrendingUp,
  Pause,
  Play,
  BarChart3,
  Trash2
} from "lucide-react";

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !userId || userId === user?.id;
  
  const {
    profile,
    workExperiences,
    education,
    loading,
    error,
    getDisplayName,
    calculateTotalExperience,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    createEducation,
    updateEducation,
    deleteEducation
  } = useProfile(userId);

  const {
    transactions,
    offers,
    loading: transactionsLoading,
    updateTransactionStatus,
    updateOfferStatus
  } = useTransactions();

  const { 
    anuncios, 
    loading: anunciosLoading,
    deleteAnuncio
  } = useAnuncios();

  // Form states
  const [workExperienceForm, setWorkExperienceForm] = useState<{
    isOpen: boolean;
    editingItem?: any;
    title: string;
  }>({
    isOpen: false,
    editingItem: undefined,
    title: ''
  });

  const [educationForm, setEducationForm] = useState<{
    isOpen: boolean;
    editingItem?: any;
    title: string;
  }>({
    isOpen: false,
    editingItem: undefined,
    title: ''
  });

  const [activeTab, setActiveTab] = useState("professional");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-t-lg"></div>
            <div className="bg-white p-6 rounded-b-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return months > 0 ? `${years} año${years > 1 ? 's' : ''} ${months} mes${months > 1 ? 'es' : ''}` : `${years} año${years > 1 ? 's' : ''}`;
    }
    return `${months} mes${months > 1 ? 'es' : ''}`;
  };

  const getCertificationIcon = (type: string) => {
    switch (type) {
      case 'degree': return <GraduationCap className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'course': return <User className="h-4 w-4" />;
      case 'workshop': return <Building className="h-4 w-4" />;
      default: return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'disputed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente de pago';
      case 'paid': return 'Pagado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'disputed': return 'En disputa';
      default: return status;
    }
  };

  const getOfferStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOfferStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Filter data for current user
  const myTransactions = transactions.filter(t => t.buyer_id === user?.id);
  const mySentOffers = offers.filter(o => o.buyer_id === user?.id);
  const myAnuncios = anuncios.filter(a => a.user_id === user?.id);
  const myReceivedOffers = offers.filter(o => o.seller_id === user?.id);

  // Handle actions
  const handleViewAnuncio = (anuncioId: string) => {
    navigate(`/platform/anuncios/${anuncioId}`);
  };

  const handleCreateAnuncio = () => {
    navigate('/platform/crear-anuncio');
  };

  const handleEditAnuncio = (anuncioId: string) => {
    navigate(`/platform/editar-anuncio/${anuncioId}`);
  };

  const handleOfferResponse = async (offerId: string, action: 'accepted' | 'rejected') => {
    const success = await updateOfferStatus(offerId, action);
    if (success) {
      if (action === 'accepted') {
        // TODO: Aquí podrías redirigir a crear la transacción automáticamente
        alert('¡Oferta aceptada! El comprador puede proceder al pago.');
      } else {
        alert('Oferta rechazada.');
      }
    }
  };

  const handleConfirmDelivery = async (transactionId: string) => {
    const success = await updateTransactionStatus(transactionId, 'completed');
    if (success) {
      alert('¡Recepción confirmada! La transacción ha sido completada.');
    }
  };

  const handleProceedToPay = (offerId: string) => {
    // TODO: Implementar flujo de pago desde oferta aceptada
    alert('Función de pago en desarrollo. La oferta fue aceptada.');
  };

  const handleCancelOffer = async (offerId: string) => {
    const success = await updateOfferStatus(offerId, 'cancelled');
    if (success) {
      alert('Oferta cancelada.');
    }
  };

  const handleOpenChat = (type: 'transaction' | 'offer', id: string, otherUserId: string) => {
    // Navigate to messages page with specific chat context
    navigate('/platform/mensajes', { 
      state: { 
        chatType: type, 
        chatId: id, 
        otherUserId: otherUserId 
      } 
    });
  };

  // Work Experience form handlers
  const handleOpenWorkExperienceForm = (item?: any) => {
    setWorkExperienceForm({
      isOpen: true,
      editingItem: item,
      title: item ? 'Editar Experiencia Laboral' : 'Añadir Experiencia Laboral'
    });
  };

  const handleCloseWorkExperienceForm = () => {
    setWorkExperienceForm({
      isOpen: false,
      editingItem: undefined,
      title: ''
    });
  };

  const handleSubmitWorkExperience = async (data: any) => {
    if (workExperienceForm.editingItem) {
      return await updateWorkExperience(workExperienceForm.editingItem.id, data);
    } else {
      return await createWorkExperience(data);
    }
  };

  const handleDeleteWorkExperience = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta experiencia laboral?')) {
      await deleteWorkExperience(id);
    }
  };

  // Education form handlers
  const handleOpenEducationForm = (item?: any) => {
    setEducationForm({
      isOpen: true,
      editingItem: item,
      title: item ? 'Editar Formación' : 'Añadir Formación'
    });
  };

  const handleCloseEducationForm = () => {
    setEducationForm({
      isOpen: false,
      editingItem: undefined,
      title: ''
    });
  };

  const handleSubmitEducation = async (data: any) => {
    if (educationForm.editingItem) {
      return await updateEducation(educationForm.editingItem.id, data);
    } else {
      return await createEducation(data);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta formación?')) {
      await deleteEducation(id);
    }
  };

  // Anuncio handlers
  const handleDeleteAnuncio = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      const success = await deleteAnuncio(id);
      if (success) {
        alert('Anuncio eliminado correctamente.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          {/* Profile Info */}
          <CardContent className="p-6 pt-20 relative">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Avatar and basic info */}
              <div className="flex flex-col items-center md:items-start gap-4 -mt-12">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.profile_picture} />
                  <AvatarFallback className="text-xl font-semibold">
                    {getDisplayName().split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
              </Avatar>
                
                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Editar perfil
                  </Button>
                )}
              </div>
              
              {/* Name and details */}
              <div className="flex-1 space-y-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                    {profile?.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <Verified className="h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                    </div>
                  
                  {profile?.professional_title && (
                    <p className="text-lg text-muted-foreground mt-1">
                      {profile.professional_title}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center md:justify-start">
                    {profile?.location && (
                      <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                        {profile.location.city}, {profile.location.region}
                    </div>
                    )}
                    
                    {profile?.years_experience && (
                      <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                        {Math.round(calculateTotalExperience())} años de experiencia
                    </div>
                    )}
                  </div>
                </div>
                
                {/* Professional Summary */}
                {profile?.professional_summary && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {profile.professional_summary}
                    </p>
                  </div>
                )}
                
                {/* Specialties */}
                {profile?.specialties && profile.specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Especialidades:</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                  </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="professional" className="gap-2">
              <User className="h-4 w-4" />
              Profesional
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Package className="h-4 w-4" />
              Anuncios
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Professional Tab */}
          <TabsContent value="professional" className="mt-6 space-y-6">
            
            {/* Work Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Experiencia Laboral
                </CardTitle>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleOpenWorkExperienceForm()}
                  >
                    <Plus className="h-4 w-4" />
                    Añadir experiencia
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {workExperiences.length > 0 ? (
                  workExperiences.map((experience, index) => (
                    <div key={experience.id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{experience.position_title}</h3>
                          <p className="text-muted-foreground">{experience.company_name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              {formatDate(experience.start_date)} - {
                                experience.is_current ? 'Presente' : experience.end_date ? formatDate(experience.end_date) : 'Presente'
                              }
                            </span>
                            <span>
                              {calculateDuration(experience.start_date, experience.end_date)}
                            </span>
                            {experience.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {experience.location}
                              </span>
                            )}
                      </div>
                          {experience.description && (
                            <p className="text-sm mt-2 leading-relaxed">
                              {experience.description}
                            </p>
                          )}
                      </div>
                        {isOwnProfile && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenWorkExperienceForm(experience)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteWorkExperience(experience.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {index < workExperiences.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay experiencia laboral añadida</p>
                    {isOwnProfile && (
                      <Button variant="outline" className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir tu primera experiencia
                      </Button>
                    )}
                  </div>
                )}
                  </CardContent>
                </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formación y Certificaciones
                </CardTitle>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleOpenEducationForm()}
                  >
                    <Plus className="h-4 w-4" />
                    Añadir formación
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getCertificationIcon(edu.certification_type)}
                            <h3 className="font-semibold">{edu.degree_title}</h3>
                          </div>
                          <p className="text-muted-foreground">{edu.institution_name}</p>
                          {edu.field_of_study && (
                            <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              {formatDate(edu.start_date)} - {
                                edu.is_current ? 'En curso' : edu.end_date ? formatDate(edu.end_date) : 'Completado'
                              }
                            </span>
                            {!edu.is_current && edu.end_date && (
                              <span>
                                {calculateDuration(edu.start_date, edu.end_date)}
                              </span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-sm mt-2 leading-relaxed">
                              {edu.description}
                            </p>
                          )}
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenEducationForm(edu)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEducation(edu.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {index < education.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay formación añadida</p>
                    {isOwnProfile && (
                      <Button variant="outline" className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir tu primera formación
                      </Button>
                    )}
                  </div>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="mt-6 space-y-6">
            
            {/* My Purchases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Mis Compras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : myTransactions.length > 0 ? (
                  myTransactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{transaction.product_title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getTransactionStatusIcon(transaction.status)}
                            <span className="text-sm text-muted-foreground">
                              {getTransactionStatusText(transaction.status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Total: €{transaction.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleOpenChat('transaction', transaction.id, transaction.seller_id)}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Chat
                          </Button>
                          {transaction.status === 'delivered' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleConfirmDelivery(transaction.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmar recepción
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No has realizado ninguna compra</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Sent Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Ofertas Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : mySentOffers.length > 0 ? (
                  mySentOffers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">Oferta de €{offer.offered_price.toFixed(2)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Para: {anuncios.find(a => a.id === offer.anuncio_id)?.titulo || 'Producto no disponible'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getOfferStatusIcon(offer.status)}
                            <span className="text-sm text-muted-foreground">
                              {getOfferStatusText(offer.status)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(offer.created_at)}
                          </p>
                          {offer.message && (
                            <p className="text-sm mt-2 italic">"{offer.message}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {offer.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelOffer(offer.id)}
                            >
                              Cancelar oferta
                            </Button>
                          )}
                          {offer.status === 'accepted' && (
                            <Button 
                              size="sm"
                              onClick={() => handleProceedToPay(offer.id)}
                            >
                              Proceder al pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No has enviado ninguna oferta</p>
                  </div>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6 space-y-6">
            
            {/* My Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mis Anuncios
                </CardTitle>
                <Button className="gap-2" onClick={handleCreateAnuncio}>
                  <Plus className="h-4 w-4" />
                  Crear anuncio
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {anunciosLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : myAnuncios.length > 0 ? (
                  myAnuncios.map((anuncio) => (
                    <div key={anuncio.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
                              <img 
                                src={anuncio.imagenes[0]} 
                                alt={anuncio.titulo}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{anuncio.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{anuncio.categoria} • {anuncio.subcategoria}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="font-medium">€{anuncio.precio ? Number(anuncio.precio).toLocaleString() : '0'}</span>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {anuncio.visualizaciones}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {anuncio.favoritos}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {anuncio.contactos}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={anuncio.estado === 'activo' ? 'default' : 'secondary'}>
                                {anuncio.estado}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(anuncio.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleEditAnuncio(anuncio.id)}
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleDeleteAnuncio(anuncio.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes ningún anuncio publicado</p>
                    <Button className="mt-4 gap-2" onClick={handleCreateAnuncio}>
                      <Plus className="h-4 w-4" />
                      Crear tu primer anuncio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Received Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ofertas Recibidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : myReceivedOffers.length > 0 ? (
                  myReceivedOffers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">Oferta de €{offer.offered_price.toFixed(2)}</h3>
                          <p className="text-sm text-muted-foreground">
                            En: {myAnuncios.find(a => a.id === offer.anuncio_id)?.titulo || 'Tu anuncio'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getOfferStatusIcon(offer.status)}
                            <span className="text-sm text-muted-foreground">
                              {getOfferStatusText(offer.status)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(offer.created_at)}
                          </p>
                          {offer.message && (
                            <p className="text-sm mt-2 italic">"{offer.message}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {offer.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOfferResponse(offer.id, 'rejected')}
                              >
                                Rechazar
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleOfferResponse(offer.id, 'accepted')}
                              >
                                Aceptar
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleOpenChat('offer', offer.id, offer.seller_id)}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No has recibido ninguna oferta</p>
                  </div>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Configuración en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Forms */}
      <WorkExperienceForm
        isOpen={workExperienceForm.isOpen}
        onClose={handleCloseWorkExperienceForm}
        onSubmit={handleSubmitWorkExperience}
        initialData={workExperienceForm.editingItem}
        title={workExperienceForm.title}
      />

      <EducationForm
        isOpen={educationForm.isOpen}
        onClose={handleCloseEducationForm}
        onSubmit={handleSubmitEducation}
        initialData={educationForm.editingItem}
        title={educationForm.title}
      />
    </div>
  );
}