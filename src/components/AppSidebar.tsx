import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  User,
  Users,
  Search,
  ShoppingCart,
  ChevronDown,
  Calendar,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  Wrench,
  Sofa,
  Utensils,
  Package,
  Wine,
  Truck,
  UserCheck,
  Network,
  Bookmark,
  ClipboardList,
  Home,
  Compass,
  Plus,
  Star,
  Eye,
  Hash
} from "lucide-react";

// Nueva estructura de navegación
const mainSocialItems = [
  { title: "Principal", url: "/platform/comunidad", icon: Home },
  { title: "Explorar", url: "/platform/explorar", icon: Compass },
];

const communityItems = [
  { title: "Crear comunidad", url: "#", icon: Plus, action: "create-community" },
  { title: "Gestionar comunidades", url: "/platform/gestionar-comunidades", icon: Settings, disabled: true },
  { title: "Mis Comunidades", url: "/platform/mis-comunidades", icon: Hash },
];

const forYouItems = [
  { title: "Recientes", url: "/platform/recientes", icon: Eye, disabled: true },
  { title: "Tus Threads", url: "/platform/mis-threads", icon: Bookmark },
];

const searchItems = [
  { title: "Buscar", icon: Search, url: "/platform/buscar" },
];

const contractCategories = [
  { title: "Maquinaria", icon: Wrench, url: "/platform/contratar/maquinaria" },
  { title: "Mobiliario", icon: Sofa, url: "/platform/contratar/mobiliario" },
  { title: "Utensilios", icon: Utensils, url: "/platform/contratar/utensilios" },
  { title: "Menaje", icon: Package, url: "/platform/contratar/menaje" },
  { title: "Bodega", icon: Wine, url: "/platform/contratar/bodega" },
  { title: "Aprovisionamientos", icon: Truck, url: "/platform/contratar/aprovisionamientos" },
  { title: "Servicios", icon: Users, url: "/platform/contratar/servicios" },
];

const contractItems = [
  { title: "Mis anuncios", url: "/platform/mis-anuncios", icon: ClipboardList },
  { title: "Transacciones", url: "/platform/transacciones", icon: Calendar },
];

const footerItems = [
  { title: "Soporte", url: "/platform/soporte", icon: HelpCircle },
  { title: "Ajustes", url: "/platform/ajustes", icon: Settings },
];

interface AppSidebarProps {
  onCreateCommunity?: () => void;
}

export function AppSidebar({ onCreateCommunity }: AppSidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [communityOpen, setCommunityOpen] = useState(true);

  const handleItemClick = (item: any) => {
    console.log('AppSidebar handleItemClick called with item:', item);
    console.log('onCreateCommunity function available:', !!onCreateCommunity);
    
    if (item.action === 'create-community' && onCreateCommunity) {
      console.log('Calling onCreateCommunity...');
      onCreateCommunity();
    } else if (item.url && item.url !== '#') {
      console.log('Navigating to:', item.url);
      navigate(item.url);
    } else {
      console.log('No action taken for item:', item);
    }
  };
  const [forYouOpen, setForYouOpen] = useState(true);
  const [contractOpen, setContractOpen] = useState(true);

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="w-60 border-r bg-white fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40 overflow-y-auto shadow-sm">
      <div className="p-4 space-y-3">
        
        {/* Main Social Section */}
        <div className="space-y-1">
          {mainSocialItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                  isActive 
                    ? "bg-blue-100 text-blue-700 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Communities Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 px-2">Comunidades</span>
            <button 
              onClick={() => setCommunityOpen(!communityOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${communityOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {communityOpen && (
            <div className="ml-2 space-y-1">
              {communityItems.map((item) => (
                item.disabled ? (
                  <div key={item.title} className="flex items-center gap-2 p-2 rounded-md w-full text-left text-sm text-gray-700 hover:bg-gray-100 cursor-default">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                ) : item.action ? (
                  <button
                    key={item.title}
                    onClick={() => {
                      console.log('Button clicked for item:', item.title);
                      handleItemClick(item);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                      isActive 
                        ? "bg-blue-100 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                )
              ))}
            </div>
          )}
        </div>

        {/* For You Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 px-2">Para ti</span>
            <button 
              onClick={() => setForYouOpen(!forYouOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${forYouOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {forYouOpen && (
            <div className="ml-2 space-y-1">
              {forYouItems.map((item) => (
                item.disabled ? (
                  <div key={item.title} className="flex items-center gap-2 p-2 rounded-md w-full text-left text-sm text-gray-700 hover:bg-gray-100 cursor-default">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                ) : (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                      isActive 
                        ? "bg-blue-100 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                )
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Contract Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 px-2">Contratar</span>
            <button 
              onClick={() => setContractOpen(!contractOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${contractOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {contractOpen && (
            <div className="ml-2 space-y-1">
              {/* Search Button - Normal Style */}
              {searchItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                    isActive 
                      ? "bg-blue-100 text-blue-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
              
              {contractCategories.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                      isActive 
                        ? "bg-blue-100 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              
              {/* Contract Management Items */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                {contractItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                      isActive 
                        ? "bg-blue-100 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Footer Items */}
        <div className="space-y-1">
          {footerItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md w-full text-left text-sm transition-colors ${
                isActive 
                  ? "bg-blue-100 text-blue-700 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>

      </div>
    </div>
  );
}