import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTransactionsSimple } from "@/hooks/useTransactionsSimple";
import { useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAnunciosSimple } from "@/hooks/useAnunciosSimple";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search,
  Send,
  MoreVertical,
  Clock,
  CheckCheck,
  Plus,
  Filter,
  Archive,
  Star,
  MessageSquare,
  ChevronDown
} from "lucide-react";

const conversations = [
  {
    id: "1",
    name: "Hotel Plaza Mayor",
    lastMessage: "¿Tienes disponible el lavavajillas para el próximo mes?",
    timestamp: "10:30",
    unread: 2,
    avatar: "/avatars/hotel.jpg",
    status: "online",
    type: "contact",
    isRequest: false
  },
  {
    id: "2", 
    name: "ChefEquip Pro",
    lastMessage: "El pedido está listo para envío",
    timestamp: "09:15",
    unread: 0,
    avatar: "/avatars/supplier.jpg",
    status: "online",
    type: "contact",
    isRequest: false
  },
  {
    id: "3",
    name: "Restaurante La Parrilla", 
    lastMessage: "Muchas gracias por el excelente servicio",
    timestamp: "Ayer",
    unread: 0,
    avatar: "/avatars/restaurant.jpg", 
    status: "offline",
    type: "contact",
    isRequest: false
  },
  {
    id: "4",
    name: "Ingredientes Frescos SL",
    lastMessage: "Nueva oferta disponible: 20% descuento",
    timestamp: "Ayer",
    unread: 1,
    avatar: "/avatars/fresh.jpg",
    status: "offline", 
    type: "contact",
    isRequest: false
  },
  {
    id: "5",
    name: "Café Central",
    lastMessage: "¿Cuándo podemos programar la devolución?",
    timestamp: "2 días",
    unread: 0,
    avatar: "/avatars/cafe.jpg",
    status: "offline",
    type: "contact",
    isRequest: false
  },
  {
    id: "6",
    name: "Nuevo Restaurante XYZ",
    lastMessage: "Hola, me interesa conocer más sobre tus servicios",
    timestamp: "1 hora",
    unread: 1,
    avatar: "/avatars/new-restaurant.jpg",
    status: "online",
    type: "request",
    isRequest: true
  },
  {
    id: "7",
    name: "Hostel Barcelona Centro",
    lastMessage: "¿Podrías enviarme información sobre alquiler de equipos?",
    timestamp: "3 horas",
    unread: 1,
    avatar: "/avatars/hostel.jpg",
    status: "offline",
    type: "request", 
    isRequest: true
  }
];

const currentMessages = [
  {
    id: "1",
    sender: "Hotel Plaza Mayor",
    message: "Hola, estoy interesado en alquilar el lavavajillas industrial que tienes publicado.",
    timestamp: "10:25",
    isMe: false
  },
  {
    id: "2", 
    sender: "Tú",
    message: "¡Hola! Sí, está disponible. ¿Para qué fechas lo necesitas?",
    timestamp: "10:26",
    isMe: true
  },
  {
    id: "3",
    sender: "Hotel Plaza Mayor", 
    message: "¿Tienes disponible el lavavajillas para el próximo mes? Sería desde el 1 de febrero hasta el 28.",
    timestamp: "10:30",
    isMe: false
  }
];

const ConversationList = ({ conversations, selectedId, onSelect }: { 
  conversations: any[], 
  selectedId: string | null, 
  onSelect: (id: string) => void 
}) => (
  <div className="space-y-1">
    {conversations.map((conv) => (
      <div
        key={conv.id}
        onClick={() => onSelect(conv.id)}
        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          selectedId === conv.id ? 'bg-muted' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conv.avatar} />
              <AvatarFallback>{conv.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
              conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">{conv.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                {conv.unread > 0 && (
                  <Badge className="h-5 w-5 text-xs flex items-center justify-center p-0">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
              {conv.isRequest && (
                <Badge variant="destructive" className="text-xs">
                  Solicitud
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const MessageBubble = ({ message, isMe }: { message: any, isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
      isMe 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted'
    }`}>
      <p className="text-sm">{message.message}</p>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs opacity-70">{message.timestamp}</span>
        {isMe && <CheckCheck className="h-3 w-3 opacity-70" />}
      </div>
    </div>
  </div>
);

export default function Mensajes() {
  const location = useLocation();
  const { user } = useAuth();
  const { transactions, offers } = useTransactionsSimple();
  const { anuncios } = useAnunciosSimple();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedChatType, setSelectedChatType] = useState<'transaction' | 'offer' | 'contact' | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  // Check if we came from a specific chat link
  useEffect(() => {
    if (location.state?.chatType && location.state?.ownerId) {
      setSelectedChatType(location.state.chatType);
      setOtherUserId(location.state.ownerId);
      
      if (location.state.chatType === 'contact') {
        setSelectedChatId(location.state.anuncioId);
        // Create the conversation ID that matches our new conversation format
        const conversationId = `contact-${location.state.anuncioId}-${location.state.ownerId}`;
        setSelectedConversation(conversationId);
      } else {
        setSelectedChatId(location.state.chatId);
        setSelectedConversation(`${location.state.chatType}-${location.state.chatId}`);
      }
    }
  }, [location.state]);

  // Get real conversations from transactions, offers, and contact messages
  const getRealConversations = () => {
    const conversations: any[] = [];

    // Add conversations from transactions (where user is buyer)
    transactions.filter(t => t.buyer_id === user?.id).forEach(transaction => {
      conversations.push({
        id: `transaction-${transaction.id}`,
        name: `Vendedor - ${transaction.product_title}`,
        lastMessage: "Conversación sobre tu compra",
        timestamp: formatDistanceToNow(new Date(transaction.created_at), { locale: es }),
        unread: 0, // TODO: Calculate real unread count
        avatar: null,
        status: "offline",
        type: "transaction",
        isRequest: false,
        data: transaction,
        otherUserId: transaction.seller_id
      });
    });

    // Add conversations from transactions (where user is seller)
    transactions.filter(t => t.seller_id === user?.id).forEach(transaction => {
      conversations.push({
        id: `transaction-${transaction.id}`,
        name: `Comprador - ${transaction.product_title}`,
        lastMessage: "Conversación sobre tu venta",
        timestamp: formatDistanceToNow(new Date(transaction.created_at), { locale: es }),
        unread: 0,
        avatar: null,
        status: "offline",
        type: "transaction",
        isRequest: false,
        data: transaction,
        otherUserId: transaction.buyer_id
      });
    });

    // Add conversations from offers (where user sent offers)
    offers.filter(o => o.buyer_id === user?.id).forEach(offer => {
      conversations.push({
        id: `offer-${offer.id}`,
        name: `Oferta enviada - €${offer.offered_price}`,
        lastMessage: offer.message || "Oferta realizada",
        timestamp: formatDistanceToNow(new Date(offer.created_at), { locale: es }),
        unread: 0,
        avatar: null,
        status: "offline",
        type: "offer",
        isRequest: false,
        data: offer,
        otherUserId: offer.seller_id
      });
    });

    // Add conversations from offers (where user received offers)
    offers.filter(o => o.seller_id === user?.id).forEach(offer => {
      conversations.push({
        id: `offer-${offer.id}`,
        name: `Oferta recibida - €${offer.offered_price}`,
        lastMessage: offer.message || "Nueva oferta",
        timestamp: formatDistanceToNow(new Date(offer.created_at), { locale: es }),
        unread: offer.status === 'pending' ? 1 : 0,
        avatar: null,
        status: "offline",
        type: "offer",
        isRequest: offer.status === 'pending',
        data: offer,
        otherUserId: offer.buyer_id
      });
    });

    // Add conversations from anuncios contact (where user is owner)
    anuncios.filter(a => a.user_id === user?.id).forEach(anuncio => {
      conversations.push({
        id: `contact-${anuncio.id}-placeholder`,
        name: `Contacto sobre: ${anuncio.titulo}`,
        lastMessage: "Conversación sobre tu anuncio",
        timestamp: formatDistanceToNow(new Date(anuncio.created_at), { locale: es }),
        unread: 0,
        avatar: null,
        status: "offline",
        type: "contact",
        isRequest: false,
        data: { 
          id: anuncio.id, 
          created_at: anuncio.created_at,
          anuncio_title: anuncio.titulo,
          anuncio_id: anuncio.id
        },
        otherUserId: null
      });
    });

    // Add specific contact conversation if we came from an anuncio
    if (location.state?.chatType === 'contact' && location.state?.anuncioId && location.state?.anuncioTitle) {
      const conversationId = `contact-${location.state.anuncioId}-${location.state.ownerId}`;
      
      // Check if this conversation already exists
      const existingConv = conversations.find(c => c.id === conversationId);
      
      if (!existingConv) {
        conversations.unshift({
          id: conversationId,
          name: `Contacto sobre: ${location.state.anuncioTitle}`,
          lastMessage: "Inicia la conversación...",
          timestamp: "ahora",
          unread: 0,
          avatar: null,
          status: "offline",
          type: "contact",
          isRequest: false,
          data: {
            id: location.state.anuncioId,
            created_at: new Date().toISOString(),
            anuncio_title: location.state.anuncioTitle,
            anuncio_id: location.state.anuncioId
          },
          otherUserId: location.state.ownerId
        });
      }
    }

    return conversations.sort((a, b) => {
      // Put the selected conversation first if it exists
      if (selectedConversation && a.id === selectedConversation) return -1;
      if (selectedConversation && b.id === selectedConversation) return 1;
      return new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
    });
  };

  const realConversations = getRealConversations();

  const filteredConversations = realConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = realConversations.find(conv => conv.id === selectedConversation) || 
    // If no conversation found but we have contact details, create one dynamically
    (selectedChatType === 'contact' && selectedChatId && otherUserId && location.state?.anuncioTitle ? {
      id: selectedConversation,
      name: `Contacto sobre: ${location.state.anuncioTitle}`,
      lastMessage: "Inicia la conversación...",
      timestamp: "ahora",
      unread: 0,
      avatar: null,
      status: "offline",
      type: "contact",
      isRequest: false,
      data: {
        id: selectedChatId,
        created_at: new Date().toISOString(),
        anuncio_title: location.state.anuncioTitle,
        anuncio_id: selectedChatId
      },
      otherUserId: otherUserId
    } : null);
  
  // Get current chat messages
  const { 
    messages, 
    sendMessage, 
    loading: messagesLoading 
  } = useMessages(
    selectedChatType === 'transaction' ? selectedChatId : undefined,
    selectedChatType === 'offer' ? selectedChatId : undefined,
    selectedChatType === 'contact' ? selectedChatId : undefined
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChatType && selectedChatId) {
      const messageData = {
        message: newMessage.trim(),
        message_type: 'text' as const,
        ...(selectedChatType === 'transaction' 
          ? { transaction_id: selectedChatId } 
          : selectedChatType === 'offer'
          ? { offer_id: selectedChatId }
          : { anuncio_id: selectedChatId, receiver_id: otherUserId }
        )
      };

      const success = await sendMessage(messageData);
      if (success) {
        setNewMessage("");
      }
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv.id);
    setSelectedChatType(conv.type);
    
    if (conv.type === 'contact') {
      setSelectedChatId(conv.data.anuncio_id);
      setOtherUserId(conv.otherUserId);
    } else {
      setSelectedChatId(conv.data.id);
      setOtherUserId(conv.otherUserId);
    }
  };

  const getFilteredConversations = (filter: string) => {
    switch (filter) {
      case "unread":
        return filteredConversations.filter(c => c.unread > 0);
      case "read":
        return filteredConversations.filter(c => c.unread === 0);
      case "requests":
        return filteredConversations.filter(c => c.isRequest);
      default:
        return filteredConversations;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar con conversaciones */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Filtros responsivos */}
          <div className="mb-4">
            {/* Tabs para pantallas grandes */}
            <div className="hidden md:block">
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="unread">No leídos</TabsTrigger>
                  <TabsTrigger value="read">Leídos</TabsTrigger>
                  <TabsTrigger value="requests">Solicitudes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Select para pantallas pequeñas */}
            <div className="block md:hidden">
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border shadow-lg">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unread">No leídos</SelectItem>
                  <SelectItem value="read">Leídos</SelectItem>
                  <SelectItem value="requests">Solicitudes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de conversaciones filtradas */}
          <div className="space-y-1">
            {getFilteredConversations(activeFilter).map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConversation === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback>{conv.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{conv.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                        {conv.unread > 0 && (
                          <Badge className="h-5 w-5 text-xs flex items-center justify-center p-0">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      {conv.isRequest && (
                        <Badge variant="destructive" className="text-xs">
                          Solicitud
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentConversation.avatar} />
                    <AvatarFallback>{currentConversation.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    currentConversation.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold">{currentConversation.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentConversation.status === 'online' ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    No hay mensajes aún. ¡Inicia la conversación!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                    message={{
                      ...message,
                      timestamp: formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      }),
                      isMe: message.sender_id === user?.id
                    }} 
                    isMe={message.sender_id === user?.id} 
                  />
                ))
              )}
            </div>

            {/* Input de nuevo mensaje */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
              <p className="text-muted-foreground">
                Elige una conversación de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}