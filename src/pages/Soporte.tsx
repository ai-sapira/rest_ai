import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send
} from "lucide-react";

export default function Soporte() {
  const faqItems = [
    {
      question: "¿Cómo puedo realizar mi primer pedido?",
      answer: "Para realizar tu primer pedido, navega a la sección 'Buscar' o cualquier categoría específica, encuentra el producto que necesitas y haz clic en 'Contactar proveedor'.",
      category: "Pedidos"
    },
    {
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos transferencias bancarias, tarjetas de crédito/débito y algunos proveedores ofrecen pago contra entrega.",
      category: "Pagos"
    },
    {
      question: "¿Cómo funciona la comunidad?",
      answer: "La comunidad te permite conectar con otros profesionales del sector, compartir experiencias y obtener recomendaciones.",
      category: "Comunidad"
    },
    {
      question: "¿Cómo puedo verificar la confiabilidad de un proveedor?",
      answer: "Todos los proveedores tienen calificaciones y reseñas de otros usuarios. También puedes ver su historial de transacciones.",
      category: "Proveedores"
    }
  ];

  const supportChannels = [
    {
      title: "Chat en Vivo",
      description: "Habla directamente con nuestro equipo",
      icon: MessageSquare,
      availability: "Lun-Vie 9:00-18:00",
      status: "online"
    },
    {
      title: "Email",
      description: "Envíanos tu consulta detallada",
      icon: Mail,
      availability: "Respuesta en 24h",
      status: "available"
    },
    {
      title: "Teléfono",
      description: "Llamada directa a soporte",
      icon: Phone,
      availability: "Lun-Vie 9:00-18:00",
      status: "available"
    }
  ];

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Centro de Soporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Estamos aquí para ayudarte. Encuentra respuestas o contacta con nuestro equipo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Channels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Canales de Soporte</CardTitle>
              <CardDescription>
                Elige el método que prefieras para contactar con nosotros
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {supportChannels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <channel.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{channel.title}</h3>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{channel.availability}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.status === "online" ? "default" : "secondary"}>
                      {channel.status === "online" ? "En línea" : "Disponible"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Contactar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription>
                Las respuestas a las consultas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{item.question}</h3>
                    <Badge variant="outline" className="text-xs ml-2">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
              <Button variant="ghost" className="w-full">
                Ver todas las preguntas frecuentes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Consulta</CardTitle>
              <CardDescription>
                ¿No encuentras lo que buscas? Envíanos tu pregunta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <Input placeholder="Describe brevemente tu consulta" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Problema técnico</option>
                  <option>Consulta sobre pedidos</option>
                  <option>Información de facturación</option>
                  <option>Sugerencia de mejora</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea 
                  placeholder="Describe tu consulta en detalle..."
                  className="min-h-[120px]"
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Enviar Consulta
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Responderemos a tu consulta en un plazo máximo de 24 horas
              </p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Información sobre el estado de nuestros servicios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Plataforma Principal</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema de Mensajes</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Procesamiento de Pagos</span>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Mantenimiento</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                Ver página de estado completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}