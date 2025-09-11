import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateEducationData, Education } from "@/hooks/useProfile";

interface EducationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEducationData) => Promise<boolean>;
  initialData?: Education;
  title: string;
}

export function EducationForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: EducationFormProps) {
  const [formData, setFormData] = useState<CreateEducationData>({
    institution_name: initialData?.institution_name || '',
    degree_title: initialData?.degree_title || '',
    field_of_study: initialData?.field_of_study || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    description: initialData?.description || '',
    is_current: initialData?.is_current || false,
    certification_type: initialData?.certification_type || 'degree'
  });
  
  const [loading, setLoading] = useState(false);

  // Sync when opening: preload data for edit or clear for create
  useEffect(() => {
    const toDateInput = (value?: string) => (value ? value.substring(0, 10) : '');
    if (isOpen) {
      if (initialData) {
        setFormData({
          institution_name: initialData.institution_name || '',
          degree_title: initialData.degree_title || '',
          field_of_study: initialData.field_of_study || '',
          start_date: toDateInput(initialData.start_date),
          end_date: initialData.is_current ? '' : toDateInput(initialData.end_date),
          description: initialData.description || '',
          is_current: initialData.is_current || false,
          certification_type: initialData.certification_type || 'degree',
        });
      } else {
        setFormData({
          institution_name: '',
          degree_title: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          description: '',
          is_current: false,
          certification_type: 'degree',
        });
      }
    }
  }, [isOpen, initialData]);

  const certificationTypes = [
    { value: 'degree', label: 'Título Universitario' },
    { value: 'certification', label: 'Certificación' },
    { value: 'course', label: 'Curso' },
    { value: 'workshop', label: 'Taller/Workshop' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          institution_name: '',
          degree_title: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          description: '',
          is_current: false,
          certification_type: 'degree'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEducationData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Añade o edita tu formación y certificaciones.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution_name">Institución *</Label>
              <Input
                id="institution_name"
                value={formData.institution_name}
                onChange={(e) => handleInputChange('institution_name', e.target.value)}
                placeholder="Ej: Universidad de Barcelona"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification_type">Tipo *</Label>
              <Select
                value={formData.certification_type}
                onValueChange={(value) => handleInputChange('certification_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree_title">Título/Certificación *</Label>
            <Input
              id="degree_title"
              value={formData.degree_title}
              onChange={(e) => handleInputChange('degree_title', e.target.value)}
              placeholder="Ej: Grado en Ciencias Gastronómicas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_study">Campo de estudio</Label>
            <Input
              id="field_of_study"
              value={formData.field_of_study}
              onChange={(e) => handleInputChange('field_of_study', e.target.value)}
              placeholder="Ej: Gastronomía y Artes Culinarias"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => {
                handleInputChange('is_current', checked === true);
                if (checked) {
                  handleInputChange('end_date', '');
                }
              }}
            />
            <Label htmlFor="is_current">En curso</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe lo que aprendiste, proyectos destacados, etc..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
