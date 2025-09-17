import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Users, 
  LogOut, 
  MessageCircle,
  CheckCircle,
  Heart,
  MessageSquare,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/CreateButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'like',
    icon: Heart,
    title: 'Nuevo me gusta',
    message: 'A María García le gustó tu publicación sobre "Equipos de cocina"',
    time: '2m',
    unread: true
  },
  {
    id: 2,
    type: 'comment',
    icon: MessageSquare,
    title: 'Nuevo comentario',
    message: 'Juan Pérez comentó en tu anuncio de "Freidora industrial"',
    time: '15m',
    unread: true
  },
  {
    id: 3,
    type: 'follow',
    icon: UserPlus,
    title: 'Nuevo seguidor',
    message: 'Ana López ahora te sigue',
    time: '1h',
    unread: true
  },
  {
    id: 4,
    type: 'transaction',
    icon: CheckCircle,
    title: 'Transacción completada',
    message: 'Se completó la venta de "Mesa de acero inoxidable"',
    time: '2h',
    unread: false
  },
  {
    id: 5,
    type: 'message',
    icon: MessageCircle,
    title: 'Nuevo mensaje',
    message: 'Tienes un mensaje de Carlos Ruiz sobre tu servicio de catering',
    time: '3h',
    unread: false
  }
];

interface PlatformNavbarProps {
  onCreatePost?: () => void;
  onCreateCommunity?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function PlatformNavbar({ onCreatePost, onCreateCommunity, activeTab = "recientes", onTabChange }: PlatformNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Memoize expensive computations
  const shouldHideTabs = useMemo(() => {
    const path = location.pathname;
    return path.includes('/post/') || 
           path.includes('/perfil') ||
           path.includes('/ajustes') ||
           path.includes('/mensajes') ||
           path.includes('/contratar/') ||
           path.includes('/buscar') ||
           path.includes('/mis-anuncios') ||
           path.includes('/transacciones') ||
           path.includes('/crear-anuncio') ||
           path.includes('/servicios/') ||
           path.includes('/anuncios/') ||
           path.includes('/proveedor/') ||
           path.includes('/explorar') ||
           path.includes('/mis-comunidades') ||
           path.includes('/comunidades/') ||
           path === '/platform';
  }, [location.pathname]);

  // Check if we should hide the create button (on profile page)
  const shouldHideCreateButton = useMemo(() => {
    return location.pathname.includes('/perfil');
  }, [location.pathname]);

  // Memoize button text logic
  const createButtonText = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/contratar/servicios')) {
      return 'Ofrecer un servicio';
    } else if (path.includes('/contratar/') || 
               path.includes('/buscar') || 
               path.includes('/mis-anuncios') || 
               path.includes('/transacciones') ||
               path.includes('/crear-anuncio')) {
      return 'Crear anuncio';
    }
    return 'Crear';
  }, [location.pathname]);

  // Optimize callbacks
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } finally {
      // Always navigate to login after local state reset
      navigate('/platform/perfil');
      // For SPA, a hard redirect ensures tokens are dropped in all tabs if needed
      setTimeout(() => {
        if (location.pathname !== '/platform/perfil') {
          navigate('/platform/perfil');
        }
      }, 50);
    }
  }, [signOut, navigate, location.pathname]);

  const handleMessagesClick = useCallback(() => {
    navigate('/platform/mensajes');
  }, [navigate]);

  const handleNetworkClick = useCallback(() => {
    navigate('/platform/mi-red');
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    navigate('/platform/perfil');
  }, [navigate]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);

  const handleSearchClose = useCallback(() => {
    setTimeout(() => setIsSearchOpen(false), 200);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle scroll to hide/show tabs
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show tabs when at top, hide when scrolling down beyond a threshold
      if (currentScrollY <= 10) {
        setIsScrolled(false);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm font-body">
        <div className="flex h-14 items-center">
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center gap-2 pl-4 w-64 flex-shrink-0">
            <img 
              src="/Guia_Repsol.svg" 
              alt="Guía Repsol" 
              className="h-6 w-auto"
            />
            <span className="font-medium text-lg text-orange-600">hostelería</span>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 flex justify-center px-8 relative">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {isSearchOpen ? (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onBlur={handleSearchClose}
                    autoFocus
                    placeholder="Buscar en hostelería"
                    className="w-full h-10 pl-10 pr-4 rounded-full border border-orange-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                    aria-label="Buscar en hostelería"
                  />
                ) : (
                  <button 
                    className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-orange-400 transition-all text-sm flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    onClick={handleSearchToggle}
                    aria-label="Abrir búsqueda"
                  >
                    <span className="text-gray-500">Buscar en hostelería</span>
                  </button>
                )}
              </div>

              {/* Search Dropdown Panel */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {/* Search Suggestions */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">Búsquedas populares</h3>
                      <div className="space-y-1">
                        {["Equipamiento cocina", "Mesas restaurante", "Menaje hostelería"].map((suggestion) => (
                          <div key={suggestion} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <Search className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Communities */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">Comunidades</h3>
                      <div className="space-y-1">
                        {[
                          { name: "Cocineros Profesionales", members: "2.4k" },
                          { name: "Gestión Restaurantes", members: "1.8k" },
                          { name: "Equipamiento Cocina", members: "987" }
                        ].map((community) => (
                          <div key={community.name} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{community.name[0]}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{community.name}</div>
                              <div className="text-xs text-gray-500">{community.members} miembros</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4 w-80 flex-shrink-0 justify-end pr-6">
            {/* Create Button with Dropdown - Hidden on profile page */}
            {!shouldHideCreateButton && (
              <CreateButton
                onCreatePost={onCreatePost}
                onCreateCommunity={onCreateCommunity}
              />
            )}

            {/* Action buttons group with more spacing */}
            <div className="flex items-center gap-3">
              {/* Mis Mensajes */}
              <Button 
                variant="ghost" 
                className="h-9 w-9 rounded-full p-0 hover:bg-gray-100 transition-colors"
                onClick={handleMessagesClick}
                aria-label="Mis Mensajes"
              >
                <MessageCircle className="h-4 w-4 text-gray-600" aria-hidden="true" />
              </Button>

              {/* Mi Red */}
              <Button 
                variant="ghost" 
                className="h-9 w-9 rounded-full p-0 hover:bg-gray-100 transition-colors"
                onClick={handleNetworkClick}
                aria-label="Mi Red"
              >
                <Users className="h-4 w-4 text-gray-600" aria-hidden="true" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 w-9 rounded-full p-0 hover:bg-gray-100 relative transition-colors"
                    aria-label="Notificaciones - 3 nuevas"
                  >
                    <Bell className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-repsol-orange text-white text-xs rounded-full flex items-center justify-center">
                      {mockNotifications.filter(n => n.unread).length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 border-b bg-gradient-to-r from-repsol-blue to-repsol-blue/95">
                  <h3 className="font-semibold text-white">Notificaciones</h3>
                  <p className="text-sm text-white/80 mt-1">
                    Tienes {mockNotifications.filter(n => n.unread).length} notificaciones sin leer
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-repsol-orange/5 ${
                          notification.unread ? 'bg-repsol-orange/10 border-l-2 border-l-repsol-orange' : ''
                        }`}
                      >
                        <div className={`mt-1 p-2 rounded-full ${
                          notification.type === 'like' ? 'bg-repsol-orange/20 text-repsol-orange' :
                          notification.type === 'comment' ? 'bg-repsol-blue/20 text-repsol-blue' :
                          notification.type === 'follow' ? 'bg-repsol-orange/20 text-repsol-orange' :
                          notification.type === 'transaction' ? 'bg-repsol-blue/20 text-repsol-blue' :
                          'bg-repsol-blue/20 text-repsol-blue'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-repsol-blue truncate">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-repsol-orange rounded-full mt-2"></div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
                <div className="p-4 border-t bg-repsol-blue/5">
                  <button className="text-sm text-repsol-blue hover:text-repsol-orange font-medium transition-colors">
                    Ver todas las notificaciones
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 w-9 rounded-full p-0 hover:bg-gray-100 transition-colors"
                    aria-label={`Menú de usuario - ${profile?.full_name || 'Usuario'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'Usuario'} />
                      <AvatarFallback className="bg-repsol-blue text-white text-xs">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-48 bg-white border border-gray-200 shadow-lg rounded-md" 
                align="end"
                sideOffset={4}
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.restaurant_name || 'Sin restaurante'}
                  </p>
                </div>
                <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer" onClick={handleProfileClick}>
                  <User className="mr-3 h-4 w-4 text-gray-500" aria-hidden="true" />
                  <span className="text-sm">Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4 text-gray-500" aria-hidden="true" />
                  <span className="text-sm">Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem 
                  className="hover:bg-gray-50 text-gray-700 cursor-pointer focus:bg-red-50 focus:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-500" aria-hidden="true" />
                  <span className="text-sm">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Tabs - positioned right below fixed navbar */}
      {!shouldHideTabs && !isScrolled && (
        <div className="fixed top-14 left-0 right-0 z-40 flex transition-transform duration-300 ease-in-out">
          <div className="w-60"></div>
          <div className="flex-1 flex justify-center px-8 relative">
            <div className="w-full max-w-2xl">
              <div className="relative pb-4">
                <nav 
                  className="w-full bg-white rounded-b-xl shadow-lg px-2 py-1.5 flex relative z-10"
                  role="tablist"
                  aria-label="Navegación principal"
                >
                  {[
                    { id: "recientes", label: "Recientes", icon: Clock },
                    { id: "popular", label: "Popular", icon: TrendingUp },
                    { id: "area", label: "Mi Área", icon: MapPin },
                    { id: "red", label: "Mi Red", icon: Users }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange?.(tab.id)}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`${tab.id}-panel`}
                        className={`
                          flex-1 h-8 flex items-center justify-center gap-1.5 text-sm font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20
                          ${isActive
                            ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-200' 
                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/50'
                          }
                        `}
                      >
                        <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
          <div className="w-80"></div>
        </div>
      )}
    </>
  );
}