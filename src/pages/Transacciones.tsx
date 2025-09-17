import React from "react";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";

const currentTransactions = [
  {
    id: "T001",
    type: "Alquiler",
    item: "Mesa de acero inoxidable",
    client: "Restaurante La Parrilla",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    amount: 280,
    status: "active",
    location: "Madrid, España"
  },
  {
    id: "T002",
    type: "Alquiler",
    item: "Lavavajillas industrial",
    client: "Hotel Plaza Mayor",
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    amount: 450,
    status: "active",
    location: "Barcelona, España"
  },
  {
    id: "T003",
    type: "Alquiler",
    item: "Juego de sartenes profesionales",
    client: "Café Central",
    startDate: "2024-01-20",
    endDate: "2024-01-27",
    amount: 85,
    status: "pending_return",
    location: "Valencia, España"
  }
];

const historicalTransactions = [
  {
    id: "T004",
    type: "Alquiler",
    item: "Horno convector",
    client: "Bistro Moderno",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    amount: 380,
    status: "completed",
    location: "Sevilla, España"
  },
  {
    id: "T005",
    type: "Venta",
    item: "Batidora industrial (usada)",
    client: "Panadería San José",
    startDate: "2023-11-15",
    endDate: "2023-11-15",
    amount: 220,
    status: "completed",
    location: "Bilbao, España"
  },
  {
    id: "T006",
    type: "Alquiler",
    item: "Plancha de cocina",
    client: "Food Truck Gourmet",
    startDate: "2023-10-05",
    endDate: "2023-10-25",
    amount: 150,
    status: "completed",
    location: "Zaragoza, España"
  },
  {
    id: "T007",
    type: "Alquiler",
    item: "Refrigerador comercial",
    client: "Cafetería Universidad",
    startDate: "2023-09-01",
    endDate: "2023-11-30",
    amount: 320,
    status: "cancelled",
    location: "Granada, España"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "pending_return":
      return <Clock className="h-4 w-4 text-repsol-orange" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-repsol-blue" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    case "pending_return":
      return "bg-orange-50 text-repsol-orange border-repsol-orange/30 hover:bg-orange-100";
    case "completed":
      return "bg-blue-50 text-repsol-blue border-repsol-blue/30 hover:bg-blue-100";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Activo";
    case "pending_return":
      return "Pendiente devolución";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

const TransactionRow = ({ transaction, showActions = true }: { transaction: any, showActions?: boolean }) => (
  <div className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-orange-50/30 rounded-lg transition-all duration-200 border border-transparent hover:border-repsol-blue/20">
    <div className="flex items-center gap-4 p-4">
      {/* Product & Client */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-repsol-blue/10 rounded-lg flex-shrink-0">
            <Package className="h-5 w-5 text-repsol-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-repsol-blue transition-colors line-clamp-1">
              {transaction.item}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">{transaction.client}</p>
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="hidden md:block text-center min-w-[80px]">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-repsol-orange">
          {transaction.type}
        </span>
      </div>

      {/* Amount */}
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-green-600">€{transaction.amount}</p>
        <p className="text-xs text-gray-500">total</p>
      </div>

      {/* Period */}
      <div className="hidden lg:block text-center min-w-[120px]">
        <p className="text-sm font-medium text-gray-900">
          {new Date(transaction.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
        </p>
        <p className="text-xs text-gray-500">
          hasta {new Date(transaction.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
        </p>
      </div>

      {/* Location */}
      <div className="hidden xl:block text-center min-w-[100px]">
        <p className="text-sm text-gray-900 line-clamp-1">{transaction.location.split(',')[0]}</p>
        <p className="text-xs text-gray-500">ubicación</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 min-w-[120px] justify-center">
        {getStatusIcon(transaction.status)}
        <Badge variant="outline" className={getStatusColor(transaction.status)}>
          {getStatusText(transaction.status)}
        </Badge>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-repsol-blue hover:bg-repsol-blue hover:text-white transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </div>
);

const TransactionsSummary = ({ transactions, title }: { transactions: any[], title: string }) => {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const activeCount = transactions.filter(t => t.status === 'active' || t.status === 'pending_return').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border border-gray-200 hover:border-repsol-blue/30 bg-gradient-to-br from-white to-blue-50/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-repsol-blue/10 rounded-xl">
              <Package className="h-6 w-6 text-repsol-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-repsol-blue">{transactions.length}</p>
              <p className="text-sm text-gray-600">Total {title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-200 hover:border-repsol-orange/30 bg-gradient-to-br from-white to-orange-50/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-repsol-orange/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-repsol-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-repsol-orange">{activeCount}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-200 hover:border-green-200 bg-gradient-to-br from-white to-green-50/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">€{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Ingresos totales</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Transacciones() {
  return (
    <motion.main 
      className="flex-1 bg-background min-h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-repsol-blue rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
              <p className="text-gray-600 mt-1">
                Gestiona todas tus transacciones de alquiler y venta
              </p>
            </div>
          </div>
        </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Transacciones Actuales</TabsTrigger>
          <TabsTrigger value="historical">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <TransactionsSummary transactions={currentTransactions} title="Actuales" />
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lista de Transacciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Header */}
              <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="flex-1">Producto & Cliente</div>
                <div className="hidden md:block text-center min-w-[80px]">Tipo</div>
                <div className="text-center min-w-[80px]">Importe</div>
                <div className="hidden lg:block text-center min-w-[120px]">Período</div>
                <div className="hidden xl:block text-center min-w-[100px]">Ubicación</div>
                <div className="text-center min-w-[120px]">Estado</div>
                <div className="w-10"></div>
              </div>
              
              {/* Transactions */}
              <div className="divide-y divide-gray-100">
                {currentTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {currentTransactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes transacciones activas</h3>
                <p className="text-muted-foreground">
                  Cuando tengas alquileres activos, aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="historical" className="space-y-6">
          <TransactionsSummary transactions={historicalTransactions} title="Históricas" />
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Header */}
              <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="flex-1">Producto & Cliente</div>
                <div className="hidden md:block text-center min-w-[80px]">Tipo</div>
                <div className="text-center min-w-[80px]">Importe</div>
                <div className="hidden lg:block text-center min-w-[120px]">Período</div>
                <div className="hidden xl:block text-center min-w-[100px]">Ubicación</div>
                <div className="text-center min-w-[120px]">Estado</div>
                <div className="w-10"></div>
              </div>
              
              {/* Transactions */}
              <div className="divide-y divide-gray-100">
                {historicalTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} showActions={false} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {historicalTransactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes transacciones históricas</h3>
                <p className="text-muted-foreground">
                  Tu historial de transacciones aparecerá aquí una vez que completes algunas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </motion.main>
  );
}