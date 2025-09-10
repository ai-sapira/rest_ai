import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions, type CreateTransactionData } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Banknote,
  Building,
  HandCoins,
  CheckCircle
} from "lucide-react";

interface PurchaseModalProps {
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
    envio: boolean;
    imagenes?: string[];
  };
}

export function PurchaseModal({ isOpen, onClose, anuncio }: PurchaseModalProps) {
  const { user } = useAuth();
  const { createTransaction, calculateCosts } = useTransactions();
  
  const [step, setStep] = useState<'delivery' | 'address' | 'payment' | 'confirmation'>('delivery');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [selectedDelivery, setSelectedDelivery] = useState<'envio_estandar' | 'envio_urgente' | 'punto_recogida' | 'recogida_persona'>('envio_estandar');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    postal_code: '',
    province: '',
    region: '',
    phone: '',
    instructions: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'>('credit_card');

  const productPrice = parseFloat(anuncio.precio);
  const costs = calculateCosts(productPrice, selectedDelivery);

  const deliveryOptions = [
    {
      id: 'envio_estandar' as const,
      title: 'Envío estándar',
      subtitle: '3-5 días laborables',
      icon: Package,
      cost: costs.shippingCost,
      available: anuncio.envio
    },
    {
      id: 'envio_urgente' as const,
      title: 'Envío urgente',
      subtitle: '24-48 horas',
      icon: Truck,
      cost: 9.99,
      available: anuncio.envio
    },
    {
      id: 'punto_recogida' as const,
      title: 'Punto de recogida',
      subtitle: 'Recoge en punto cercano',
      icon: MapPin,
      cost: 3.89,
      available: true
    },
    {
      id: 'recogida_persona' as const,
      title: 'Recogida en persona',
      subtitle: 'Quedamos para entregarlo',
      icon: HandCoins,
      cost: 0,
      available: true
    }
  ];

  const paymentMethods = [
    {
      id: 'credit_card' as const,
      title: 'Tarjeta de crédito/débito',
      subtitle: 'Visa, Mastercard, etc.',
      icon: CreditCard
    },
    {
      id: 'paypal' as const,
      title: 'PayPal',
      subtitle: 'Pago seguro con PayPal',
      icon: Shield
    },
    {
      id: 'bank_transfer' as const,
      title: 'Transferencia bancaria',
      subtitle: 'Transferencia directa',
      icon: Building
    },
    {
      id: 'cash_on_delivery' as const,
      title: 'Pago contra reembolso',
      subtitle: 'Paga al recibir el producto',
      icon: Banknote,
      available: selectedDelivery === 'recogida_persona'
    }
  ];

  const handleDeliverySelect = (delivery: typeof selectedDelivery) => {
    setSelectedDelivery(delivery);
  };

  const handleContinue = () => {
    if (step === 'delivery') {
      if (selectedDelivery === 'recogida_persona') {
        setStep('payment');
      } else {
        setStep('address');
      }
    } else if (step === 'address') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'address') {
      setStep('delivery');
    } else if (step === 'payment') {
      if (selectedDelivery === 'recogida_persona') {
        setStep('delivery');
      } else {
        setStep('address');
      }
    } else if (step === 'confirmation') {
      setStep('payment');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar');
      return;
    }

    if (user.id === anuncio.user_id) {
      toast.error('No puedes comprar tu propio anuncio');
      return;
    }

    setLoading(true);

    try {
      const transactionData: CreateTransactionData = {
        anuncio_id: anuncio.id,
        seller_id: anuncio.user_id,
        product_title: anuncio.titulo,
        product_price: productPrice,
        delivery_method: selectedDelivery,
        payment_method: selectedPayment
      };

      if (selectedDelivery !== 'recogida_persona') {
        transactionData.delivery_address = deliveryAddress;
      }

      const transaction = await createTransaction(transactionData);

      if (transaction) {
        toast.success('¡Compra realizada con éxito!');
        onClose();
        // TODO: Redirigir a página de seguimiento del pedido
      }
    } catch (error) {
      toast.error('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  const isAddressValid = selectedDelivery === 'recogida_persona' || (
    deliveryAddress.street && 
    deliveryAddress.city && 
    deliveryAddress.postal_code && 
    deliveryAddress.province && 
    deliveryAddress.phone
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Comprar producto
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
                  <p className="text-sm text-gray-500">{anuncio.ubicacion.city}, {anuncio.ubicacion.region}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">€{productPrice.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {step === 'delivery' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Elige cómo quieres recibirlo</h3>
              
              <div className="space-y-3">
                {deliveryOptions.filter(option => option.available).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleDeliverySelect(option.id)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      selectedDelivery === option.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <option.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{option.title}</div>
                          <div className="text-sm text-gray-500">{option.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {option.cost === 0 ? 'Gratis' : `€${option.cost.toFixed(2)}`}
                        </div>
                        {selectedDelivery === option.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dirección de entrega</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Dirección completa *</Label>
                  <Input
                    id="street"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Calle, número, piso, puerta..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ciudad"
                  />
                </div>
                
                <div>
                  <Label htmlFor="postal_code">Código postal *</Label>
                  <Input
                    id="postal_code"
                    value={deliveryAddress.postal_code}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="28001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Input
                    id="province"
                    value={deliveryAddress.province}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="Madrid"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="600 123 456"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="instructions">Instrucciones de entrega (opcional)</Label>
                  <Textarea
                    id="instructions"
                    value={deliveryAddress.instructions}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Ej: Llamar antes de subir, segunda puerta..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Método de pago</h3>
              
              <div className="space-y-3">
                {paymentMethods.filter(method => method.available !== false).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      selectedPayment === method.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <method.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{method.title}</div>
                          <div className="text-sm text-gray-500">{method.subtitle}</div>
                        </div>
                      </div>
                      {selectedPayment === method.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirmar compra</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Producto:</span>
                  <span>€{productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protección HubConnect:</span>
                  <span>€{costs.protectionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{costs.shippingCost === 0 ? 'Gratis' : `€${costs.shippingCost.toFixed(2)}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>€{costs.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Compra protegida</p>
                    <p className="text-blue-700">
                      Tu dinero está protegido hasta que confirmes que has recibido el producto en perfecto estado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          {step !== 'confirmation' && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Producto:</span>
                    <span>€{productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protección HubConnect:</span>
                    <span>€{costs.protectionFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>{costs.shippingCost === 0 ? 'Gratis' : `€${costs.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>€{costs.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {step !== 'delivery' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Atrás
              </Button>
            )}
            
            {step !== 'confirmation' ? (
              <Button 
                onClick={handleContinue} 
                className="flex-1"
                disabled={step === 'address' && !isAddressValid}
              >
                Continuar
              </Button>
            ) : (
              <Button 
                onClick={handlePurchase} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Procesando...' : `Pagar €${costs.total.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
