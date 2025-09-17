import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

interface CategoryFiltersProps {
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  conditionFilter: string;
  setConditionFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (value: string) => void;
  onClearFilters: () => void;
  config: {
    priceRanges: Array<{ id: string; label: string }>;
    locations: Array<{ id: string; label: string }>;
    conditions: Array<{ id: string; label: string }>;
    types: Array<{ id: string; label: string }>;
    subcategories: Array<{ id: string; label: string }>;
  };
}

export function CategoryFilters({
  priceFilter,
  setPriceFilter,
  locationFilter,
  setLocationFilter,
  conditionFilter,
  setConditionFilter,
  typeFilter,
  setTypeFilter,
  subcategoryFilter,
  setSubcategoryFilter,
  onClearFilters,
  config
}: CategoryFiltersProps) {
  const hasActiveFilters = [
    priceFilter,
    locationFilter,
    conditionFilter,
    typeFilter,
    subcategoryFilter
  ].some(filter => filter !== "todos");

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Price Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Precio</label>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los precios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los precios</SelectItem>
              {config.priceRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Ubicación</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las ubicaciones</SelectItem>
              {config.locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Estado</label>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {config.conditions.map((condition) => (
                <SelectItem key={condition.id} value={condition.id}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Tipo</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {config.types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Subcategoría</label>
          <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas las subcategorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las subcategorías</SelectItem>
              {config.subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
