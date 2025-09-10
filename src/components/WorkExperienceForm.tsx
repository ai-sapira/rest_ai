import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CreateWorkExperienceData, WorkExperience } from "@/hooks/useProfile";

interface WorkExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkExperienceData) => Promise<boolean>;
  initialData?: WorkExperience;
  title: string;
}

export function WorkExperienceForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: WorkExperienceFormProps) {
  const [formData, setFormData] = useState<CreateWorkExperienceData>({
    company_name: initialData?.company_name || '',
    position_title: initialData?.position_title || '',
    location: initialData?.location || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    description: initialData?.description || '',
    is_current: initialData?.is_current || false
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          company_name: '',
          position_title: '',
          location: '',
          start_date: '',
          end_date: '',
          description: '',
          is_current: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateWorkExperienceData, value: string | boolean) => {
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
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Ej: Restaurant La Bella Vista"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_title">Puesto *</Label>
              <Input
                id="position_title"
                value={formData.position_title}
                onChange={(e) => handleInputChange('position_title', e.target.value)}
                placeholder="Ej: Chef Ejecutivo"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ej: Barcelona, España"
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
            <Label htmlFor="is_current">Trabajo actual</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe tus responsabilidades y logros en este puesto..."
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
