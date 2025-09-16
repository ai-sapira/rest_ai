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
      return <Clock className="h-4 w-4 text-orange-600" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending_return":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "completed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

const TransactionCard = ({ transaction, showActions = true }: { transaction: any, showActions?: boolean }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{transaction.item}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{transaction.client}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(transaction.status)}
          <Badge variant="secondary" className={getStatusColor(transaction.status)}>
            {getStatusText(transaction.status)}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Tipo:</span>
            <span>{transaction.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Importe:</span>
            <span className="font-semibold text-green-600">€{transaction.amount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Inicio:</span>
            <span>{new Date(transaction.startDate).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Fin:</span>
            <span>{new Date(transaction.endDate).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Ubicación:</span>
            <span>{transaction.location}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const TransactionsSummary = ({ transactions, title }: { transactions: any[], title: string }) => {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const activeCount = transactions.filter(t => t.status === 'active' || t.status === 'pending_return').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total {title}</p>
              <p className="text-xl font-semibold">{transactions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-xl font-semibold">{activeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Ingresos totales</p>
              <p className="text-xl font-semibold">€{totalRevenue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Transacciones() {
  return (
    <motion.div 
      className="container mx-auto p-6 space-y-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transacciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus transacciones de alquiler y venta
          </p>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Transacciones Actuales</TabsTrigger>
          <TabsTrigger value="historical">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <TransactionsSummary transactions={currentTransactions} title="Actuales" />
          
          <div className="grid gap-4">
            {currentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
          
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
          
          <div className="grid gap-4">
            {historicalTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} showActions={false} />
            ))}
          </div>
          
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
    </motion.div>
  );
}