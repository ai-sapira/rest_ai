import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Marketplace",
      links: [
        "Todas las categorías",
        "Equipamiento cocina",
        "Ingredientes frescos",
        "Mobiliario",
        "Ofertas especiales"
      ]
    },
    {
      title: "Comunidad",
      links: [
        "Red de hosteleros",
        "Foros de discusión",
        "Eventos y ferias",
        "Casos de éxito",
        "Blog profesional"
      ]
    },
    {
      title: "Soporte",
      links: [
        "Centro de ayuda",
        "Contactar soporte",
        "Guías y tutoriales",
        "FAQ",
        "Estado del servicio"
      ]
    },
    {
      title: "Empresa",
      links: [
        "Sobre nosotros",
        "Equipo",
        "Prensa",
        "Carreras",
        "Inversores"
      ]
    }
  ];

  return (
    <footer className="bg-foreground text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">H</span>
              </div>
              <span className="text-2xl font-bold">HostelMarket</span>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              La plataforma B2B líder para profesionales de la hostelería. 
              Conectamos a restauradores, chefs y hosteleros con los mejores proveedores del sector.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <Mail className="w-5 h-5 mr-3 text-secondary" />
                <span>contacto@hostelmarket.com</span>
              </div>
              <div className="flex items-center text-white/80">
                <Phone className="w-5 h-5 mr-3 text-secondary" />
                <span>+34 900 123 456</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin className="w-5 h-5 mr-3 text-secondary" />
                <span>Madrid, Barcelona, Valencia</span>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 text-secondary">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-secondary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Newsletter */}
        <div className="bg-white/5 rounded-2xl p-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">
              Mantente al día con las últimas novedades
            </h3>
            <p className="text-white/80">
              Recibe ofertas exclusivas, nuevos productos y noticias del sector
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button className="bg-gradient-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary-hover transition-all duration-300 transform hover:scale-105">
              Suscribirse
            </button>
          </div>
        </div>
        
        {/* Social Links & Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-white/60 text-sm">
              <span>© 2024 HostelMarket. Todos los derechos reservados.</span>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-secondary transition-colors">Privacidad</a>
                <a href="#" className="hover:text-secondary transition-colors">Términos</a>
                <a href="#" className="hover:text-secondary transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;