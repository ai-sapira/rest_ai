import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { signIn, signUp } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    const { error } = await signUp(email, password, fullName)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <img 
              src="/Guia_Repsol.svg" 
              alt="Guía Repsol" 
              className="h-12 w-auto"
            />
            <span className="font-medium text-2xl text-orange-600 italic">community</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-500">Conecta con profesionales de la comunidad</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-orange-100 shadow-sm">
            <TabsTrigger 
              value="login" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Iniciar sesión
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="rounded-lg data-[state=active]:bg-repsol-blue data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent"></div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Iniciar sesión
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Accede a tu cuenta para conectar con la comunidad
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <span>Iniciar sesión</span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent"></div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Crear Cuenta
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Únete a la comunidad de profesionales
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="h-12 border-2 border-gray-200 focus:border-repsol-blue focus:ring-repsol-blue/20 rounded-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="h-12 border-2 border-gray-200 focus:border-repsol-blue focus:ring-repsol-blue/20 rounded-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700">Contraseña</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 border-2 border-gray-200 focus:border-repsol-blue focus:ring-repsol-blue/20 rounded-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-repsol-blue hover:bg-repsol-blue/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creando cuenta...</span>
                      </div>
                    ) : (
                      <span>Crear Cuenta</span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

