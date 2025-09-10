import { Button } from "@/components/ui/button";
import { Search, Menu, Bell, User } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-border z-50 shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold text-primary">HostelMarket</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors">
              Comunidad
            </a>
            <a href="#suppliers" className="text-foreground hover:text-primary transition-colors">
              Proveedores
            </a>
            <a href="#solutions" className="text-foreground hover:text-primary transition-colors">
              Soluciones
            </a>
          </nav>
          
          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-muted rounded-lg px-4 py-2 w-96">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Buscar productos, proveedores..." 
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="hidden md:flex">
              Iniciar Sesión
            </Button>
            
            <Button variant="default" size="sm" className="hidden md:flex">
              Registrarse
            </Button>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border animate-slide-up">
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center bg-muted rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm"
                />
              </div>
              
              <a href="#marketplace" className="text-foreground hover:text-primary transition-colors py-2">
                Marketplace
              </a>
              <a href="#community" className="text-foreground hover:text-primary transition-colors py-2">
                Comunidad
              </a>
              <a href="#suppliers" className="text-foreground hover:text-primary transition-colors py-2">
                Proveedores
              </a>
              <a href="#solutions" className="text-foreground hover:text-primary transition-colors py-2">
                Soluciones
              </a>
              
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
                <Button variant="default" size="sm">
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;