import { Button } from "@/components/ui/button";
import { ArrowRight, Users, ShoppingCart, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Professional hospitality marketplace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            El <span className="text-orange-500 bg-orange-100 px-3 py-1 rounded-lg">Marketplace B2B</span> 
            <br />para <span className="text-blue-900">Hostelería</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Conecta con proveedores, descubre productos innovadores y haz crecer tu negocio 
            en la comunidad más grande de profesionales de la hostelería.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg transform hover:scale-105 transition-all" asChild>
              <a href="/platform">
                Comenzar Ahora
                <ArrowRight className="ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-500 hover:text-white font-semibold shadow-lg transform hover:scale-105 transition-all">
              Ver Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-orange-400">+5,000</div>
              <div className="text-white/80">Hosteleros Activos</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-orange-400">+20,000</div>
              <div className="text-white/80">Productos Disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-orange-400">95%</div>
              <div className="text-white/80">Satisfacción Cliente</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;