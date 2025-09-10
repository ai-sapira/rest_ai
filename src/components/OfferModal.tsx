import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions, type CreateOfferData } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Package,
  Euro,
  MessageCircle,
  TrendingDown,
  Clock
} from "lucide-react";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  anuncio: {
    id: string;
    user_id: string;
    titulo: string;
    precio: string;
    descripcion: string;
    categoria: string;
    subcategoria: string;
    ubicacion: {
      city: string;
      region: string;
    };
    imagenes?: string[];
  };
}

export function OfferModal({ isOpen, onClose, anuncio }: OfferModalProps) {
  const { user } = useAuth();
  const { createOffer } = useTransactions();
  
  const [loading, setLoading] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [message, setMessage] = useState('');

  const originalPrice = parseFloat(anuncio.precio);
  const offeredPriceNum = parseFloat(offeredPrice);
  const discount = offeredPriceNum ? ((originalPrice - offeredPriceNum) / originalPrice * 100) : 0;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para hacer una oferta');
      return;
    }

    if (user.id === anuncio.user_id) {
      toast.error('No puedes hacer una oferta en tu propio anuncio');
      return;
    }

    if (!offeredPrice || offeredPriceNum <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    if (offeredPriceNum >= originalPrice) {
      toast.error('Tu oferta debe ser menor al precio original');
      return;
    }

    setLoading(true);

    try {
      const offerData: CreateOfferData = {
        anuncio_id: anuncio.id,
        seller_id: anuncio.user_id,
        offered_price: offeredPriceNum,
        message: message.trim() || undefined
      };

      const offer = await createOffer(offerData);

      if (offer) {
        toast.success('¡Oferta enviada con éxito!');
        onClose();
        setOfferedPrice('');
        setMessage('');
      }
    } catch (error) {
      toast.error('Error al enviar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedOffers = () => {
    const suggestions = [
      Math.round(originalPrice * 0.85), // 15% descuento
      Math.round(originalPrice * 0.80), // 20% descuento
      Math.round(originalPrice * 0.75), // 25% descuento
    ];
    return suggestions.filter(price => price > 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Hacer una oferta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
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
                  <h3 className="font-medium line-clamp-2">{anuncio.titulo}</h3>
                  <p className="text-sm text-gray-500">{anuncio.subcategoria}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Precio original:</span>
                    <span className="text-lg font-bold">€{originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Price */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Tu oferta *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="1"
                  max={originalPrice - 1}
                  step="0.01"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              
              {offeredPriceNum > 0 && offeredPriceNum < originalPrice && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {discount.toFixed(1)}% menos que el precio original
                  </span>
                </div>
              )}
            </div>

            {/* Suggested Offers */}
            <div>
              <Label className="text-sm font-medium">Ofertas sugeridas:</Label>
              <div className="flex gap-2 mt-2">
                {getSuggestedOffers().map((price) => (
                  <button
                    key={price}
                    onClick={() => setOfferedPrice(price.toString())}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    €{price}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Mensaje para el vendedor (opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: ¿Estarías dispuesto a aceptar esta oferta? El producto me interesa mucho..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 caracteres
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">¿Cómo funciona?</p>
                <p className="text-blue-700">
                  El vendedor tiene 7 días para aceptar o rechazar tu oferta. 
                  Si la acepta, podrás proceder con la compra al precio ofertado.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={loading || !offeredPrice || offeredPriceNum <= 0 || offeredPriceNum >= originalPrice}
            >
              {loading ? 'Enviando...' : 'Enviar oferta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
