import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, MessageCircle, Truck, Clock, Star, ChevronRight } from "lucide-react";
import type { Anuncio } from "@/hooks/useAnunciosSimple";

interface AnuncioCardProps {
  anuncio: Anuncio;
  getTypeColor: (tipo: string) => string;
  getTypeLabel: (tipo: string) => string;
  getConditionColor: (estado: string) => string;
  formatDate: (dateString: string) => string;
}

export function AnuncioCard({ 
  anuncio, 
  getTypeColor, 
  getTypeLabel, 
  getConditionColor, 
  formatDate 
}: AnuncioCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/platform/anuncios/${anuncio.id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement contact functionality
    console.log('Contact clicked for anuncio:', anuncio.id);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-repsol-blue/40 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/40 rounded-xl overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Section - With Color */}
      <div className="relative">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
            <img 
              src={anuncio.imagenes[0]} 
              alt={anuncio.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-8">
            <img 
              src="/Guia_Repsol.svg" 
              alt="Guía Repsol" 
              className="w-24 h-auto opacity-30"
            />
          </div>
        )}

        {/* Type and Features - Top Left - Clean */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-repsol-blue text-white border-0 shadow-lg">
            {getTypeLabel(anuncio.actor_type === 'provider' ? 'oferta' : 'vendo')}
          </Badge>
          {anuncio.envio && (
            <Badge className="bg-repsol-orange text-white border-0 shadow-lg">
              <Truck className="h-3 w-3 mr-1" />
              Envío
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title with Subcategory and State */}
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-lg leading-tight group-hover:text-repsol-blue transition-colors">
            {anuncio.titulo}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {anuncio.subcategoria && (
              <Badge variant="outline" className="text-repsol-blue border-repsol-blue/30 bg-blue-50 text-xs">
                {anuncio.subcategoria}
              </Badge>
            )}
            {anuncio.estado_producto && (
              <Badge variant="outline" className="text-repsol-orange border-repsol-orange/30 bg-orange-50 text-xs">
                {anuncio.estado_producto}
              </Badge>
            )}
          </div>
        </div>

        {/* Description - Short */}
        <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
          {anuncio.descripcion}
        </p>

        {/* Location with Color */}
        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 bg-repsol-blue/10 rounded-full">
            <MapPin className="h-3.5 w-3.5 text-repsol-blue" />
          </div>
          <span className="font-medium text-gray-700 truncate">
            {typeof anuncio.ubicacion === 'string' 
              ? anuncio.ubicacion 
              : `${anuncio.ubicacion?.city || ''}, ${anuncio.ubicacion?.region || ''}`
            }
          </span>
        </div>

        {/* Stats with Color */}
        <div className="flex items-center justify-between text-xs text-gray-500 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="p-1 bg-blue-50 rounded-full">
                <Eye className="h-3 w-3 text-repsol-blue" />
              </div>
              <span className="font-medium">{anuncio.visualizaciones || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="p-1 bg-orange-50 rounded-full">
                <MessageCircle className="h-3 w-3 text-repsol-orange" />
              </div>
              <span className="font-medium">{anuncio.contactos || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span>{formatDate(anuncio.created_at)}</span>
          </div>
        </div>

        {/* Price and Contact Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
          {anuncio.precio && (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-repsol-blue">
                {anuncio.precio}€
              </span>
            </div>
          )}
          <Button 
            size="sm" 
            className={`${anuncio.precio ? 'flex-shrink-0' : 'w-full'} bg-repsol-blue hover:bg-repsol-orange text-white transition-all duration-300 shadow-md hover:shadow-lg`}
            onClick={handleContactClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
