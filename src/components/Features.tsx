import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  MessageSquare,
  Truck,
  Star
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Marketplace Especializado",
      description: "Accede a miles de productos específicos para hostelería: equipamiento, ingredientes, mobiliario y más.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Red de Profesionales",
      description: "Conecta con otros hosteleros, comparte experiencias y descubre oportunidades de negocio.",
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: "Mejores Precios B2B",
      description: "Negocia directamente con proveedores y accede a precios exclusivos para profesionales.",
      color: "text-secondary"
    },
    {
      icon: Shield,
      title: "Proveedores Verificados",
      description: "Todos nuestros proveedores están verificados y certificados para garantizar la calidad.",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Entrega Rápida",
      description: "Logística optimizada para el sector hostelero con entregas en 24-48h en principales ciudades.",
      color: "text-accent"
    },
    {
      icon: MessageSquare,
      title: "Soporte Especializado",
      description: "Equipo de atención al cliente con experiencia en hostelería para resolver cualquier duda.",
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Todo lo que tu negocio 
            <span className="text-primary"> necesita</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Una plataforma completa diseñada específicamente para los desafíos 
            y oportunidades del sector hostelero moderno.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group border-l-4 border-orange-500 hover:border-orange-600"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 group-hover:animate-bounce shadow-lg`}>
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-blue-900 mb-4 group-hover:text-orange-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-12 text-white shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                ))}
              </div>
              <span className="ml-4 text-lg">+5,000 hosteleros ya confían en nosotros</span>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-orange-400 fill-current" />
              ))}
              <span className="ml-2 text-lg">4.9/5 de satisfacción</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para hacer crecer tu negocio?
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Únete a la comunidad B2B más grande de profesionales de la hostelería
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Explorar Marketplace
              </button>
              <button className="border-2 border-orange-400 text-orange-400 bg-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
                Solicitar Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const User = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default Features;