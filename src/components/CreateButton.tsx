import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronDown,
  PlusCircle,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreateOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

interface CreateButtonProps {
  onCreatePost?: () => void;
  onCreateCommunity?: () => void;
}

export function CreateButton({ onCreatePost, onCreateCommunity }: CreateButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Determine the primary action based on current context
  const getPrimaryAction = () => {
    const path = location.pathname;
    
    if (path.includes('/contratar/servicios')) {
      return { label: 'Ofrecer servicio', action: () => navigate('/platform/crear-anuncio') };
    } else if (path.includes('/contratar/') || path.includes('/buscar') || path.includes('/mis-anuncios')) {
      return { label: 'Crear anuncio', action: () => navigate('/platform/crear-anuncio') };
    } else if (path.includes('/comunidad') || path.includes('/mis-comunidades')) {
      return { label: 'Crear post', action: () => onCreatePost?.() };
    }
    
    // Default fallback
    return { label: 'Crear', action: () => setIsOpen(true) };
  };

  const primaryAction = getPrimaryAction();

  const createOptions: CreateOption[] = [
    {
      id: 'post',
      label: 'Publicación',
      description: 'Comparte una actualización con tu comunidad',
      icon: FileText,
      action: () => onCreatePost?.(),
      shortcut: 'P'
    },
    {
      id: 'comunidad',
      label: 'Comunidad',
      description: 'Crea un espacio para profesionales afines',
      icon: Users,
      action: () => onCreateCommunity?.(),
      shortcut: 'C'
    },
    {
      id: 'vender',
      label: 'Vender producto',
      description: 'Venta normal, alquiler o servicio',
      icon: Package,
      action: () => navigate('/platform/crear-anuncio?tipo=vendo'),
      shortcut: 'V'
    },
    {
      id: 'comprar',
      label: 'Buscar producto',
      description: 'Encuentra lo que necesitas para tu negocio',
      icon: ShoppingCart,
      action: () => navigate('/platform/crear-anuncio?tipo=busco'),
      shortcut: 'B'
    }
  ];

  const handleOptionSelect = (option: CreateOption) => {
    setIsOpen(false);
    option.action();
  };

  const handlePrimaryAction = () => {
    if (primaryAction.label === 'Crear') {
      setIsOpen(true);
    } else {
      primaryAction.action();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open create menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Quick shortcuts when menu is closed
      if (!isOpen && (e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'p':
            e.preventDefault();
            onCreatePost?.();
            break;
          case 'v':
            e.preventDefault();
            navigate('/platform/crear-anuncio?tipo=vendo');
            break;
          case 'b':
            e.preventDefault();
            navigate('/platform/crear-anuncio?tipo=busco');
            break;
          case 'c':
            e.preventDefault();
            onCreateCommunity?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCreatePost, onCreateCommunity, navigate]);

  return (
    <div className="flex items-center">
      {/* Primary Action Button */}
      <Button
        onClick={handlePrimaryAction}
        className="bg-repsol-blue hover:bg-repsol-blue/90 text-white px-4 py-2 h-9 transition-all duration-200 shadow-md hover:shadow-lg rounded-l-md rounded-r-none border-r border-repsol-blue/20"
        aria-label={`${primaryAction.label} - Acción principal de creación`}
      >
        <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        {primaryAction.label}
      </Button>

      {/* Dropdown Toggle */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-repsol-blue hover:bg-repsol-blue/90 text-white px-2 h-9 transition-all duration-200 shadow-md hover:shadow-lg rounded-r-md rounded-l-none border-l border-repsol-blue/20"
            aria-label="Más opciones de creación"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-72 p-1 border border-repsol-orange/20 shadow-lg bg-white"
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Crear contenido</h3>
            <p className="text-xs text-gray-500 mt-0.5">Elige qué quieres crear</p>
          </div>

          {/* Options */}
          <div className="py-1">
            {createOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <DropdownMenuItem
                  key={option.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-repsol-orange/5 focus:bg-repsol-orange/5 rounded-md mx-1 group"
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="p-1.5 border border-repsol-orange/30 text-repsol-orange rounded-md group-hover:border-repsol-orange group-hover:bg-repsol-orange/5 transition-colors">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                      {option.shortcut && (
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                          ⌘{option.shortcut}
                        </kbd>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 text-center">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border rounded mr-1">⌘K</kbd>
              para abrir rápidamente
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
