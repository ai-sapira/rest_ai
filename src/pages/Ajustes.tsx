import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe,
  Smartphone,
  Eye,
  Lock,
  Trash2,
  Save,
  Edit
} from "lucide-react";

export default function Ajustes() {
  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuración
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu cuenta y personaliza tu experiencia en la plataforma
          </p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Nuevos mensajes</h4>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones de mensajes nuevos</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Ofertas especiales</h4>
                    <p className="text-sm text-muted-foreground">Notificaciones de descuentos y promociones</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Actividad de la comunidad</h4>
                    <p className="text-sm text-muted-foreground">Nuevos posts y respuestas en tus threads</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Actualizaciones de pedidos</h4>
                    <p className="text-sm text-muted-foreground">Estado de tus pedidos y transacciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Notificaciones por email</h4>
                    <p className="text-sm text-muted-foreground">Recibir resumen semanal por correo</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidad y Seguridad
              </CardTitle>
              <CardDescription>
                Controla la visibilidad de tu perfil y la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Perfil público</h4>
                    <p className="text-sm text-muted-foreground">Permite que otros usuarios vean tu perfil</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Mostrar estado online</h4>
                    <p className="text-sm text-muted-foreground">Indica cuando estás conectado</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Autenticación de dos factores</h4>
                    <p className="text-sm text-muted-foreground">Protección adicional para tu cuenta</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Inactivo</Badge>
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Cambiar Contraseña</h4>
                  <div className="grid gap-3">
                    <Input type="password" placeholder="Contraseña actual" />
                    <Input type="password" placeholder="Nueva contraseña" />
                    <Input type="password" placeholder="Confirmar nueva contraseña" />
                    <Button variant="outline" className="w-fit gap-2">
                      <Lock className="h-4 w-4" />
                      Actualizar Contraseña
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Cuenta</CardTitle>
              <CardDescription>
                Información sobre tu plan y uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Plan Actual</span>
                <Badge>Profesional</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pedidos este mes</span>
                <span className="text-sm font-medium">24 / 100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Almacenamiento usado</span>
                <span className="text-sm font-medium">2.3 / 10 GB</span>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                Gestionar Plan
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>
                Personaliza tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Idioma</span>
                  <select className="p-1 border rounded text-sm bg-background">
                    <option>Español</option>
                    <option>English</option>
                    <option>Français</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zona Horaria</span>
                  <select className="p-1 border rounded text-sm bg-background">
                    <option>Madrid (CET)</option>
                    <option>Barcelona (CET)</option>
                    <option>Canarias (WET)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Datos</CardTitle>
              <CardDescription>
                Controla tus datos y privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Descargar mis datos
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Globe className="h-4 w-4" />
                Exportar contactos
              </Button>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar cuenta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}