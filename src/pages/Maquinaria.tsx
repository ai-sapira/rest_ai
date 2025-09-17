import { CategoryPage } from "@/components/CategoryPage";
import { contratarConfig, matchesUnifiedType, getUnifiedTypeColor, getUnifiedTypeLabel } from "@/lib/contratarConfig";
import { Package } from "lucide-react";

export default function Maquinaria() {
  const config = contratarConfig.maquinaria;

  const getConditionColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "nuevo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "como nuevo":
        return "bg-green-100 text-green-800 border-green-200";
      case "buen estado":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "usado":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "para reparar":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <CategoryPage
      categoryName="Maquinaria"
      categoryKey="maquinaria"
      title="Maquinaria"
      description="Encuentra la maquinaria de cocina que necesitas: hornos, freidoras, equipos de refrigeración y más"
      icon={Package}
      config={config}
      getTypeColor={getUnifiedTypeColor}
      getTypeLabel={getUnifiedTypeLabel}
      getConditionColor={getConditionColor}
      matchesUnifiedType={matchesUnifiedType}
    />
  );
}