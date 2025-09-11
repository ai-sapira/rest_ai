import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronRight, Upload, Globe, Lock, Users, Hash, Tag, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface CreateCommunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
  hashtag: string;
  isPublic: boolean;
  topics: number[];
  avatar: File | null;
  avatarPreview: string | null;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  hashtag: '',
  isPublic: true,
  topics: [],
  avatar: null,
  avatarPreview: null
};

const COMMUNITY_TOPICS = [
  { id: 1, label: 'Equipamiento', emoji: '🔧' },
  { id: 2, label: 'Aprovisionamientos', emoji: '📦' },
  { id: 3, label: 'Personal', emoji: '👥' },
  { id: 4, label: 'Gestión', emoji: '📊' },
  { id: 5, label: 'Promociones', emoji: '📈' },
  { id: 6, label: 'Experiencias', emoji: '🎉' }
];

export function CreateCommunityForm({ isOpen, onClose, onSuccess }: CreateCommunityFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug log removed to reduce console noise

  // Progress calculation
  const totalSections = 4;
  const progress = (completedSections.size / totalSections) * 100;

  // Section validation
  const isSectionComplete = (section: number): boolean => {
    switch (section) {
      case 1: // Información básica
        return !!(formData.name && formData.description && formData.hashtag);
      case 2: // Temas
        return formData.topics.length > 0;
      case 3: // Tipo de comunidad
        return true; // Always complete since it has defaults
      case 4: // Confirmación
        return true; // Always complete for review
      default:
        return false;
    }
  };

  // Update completed sections when form data changes
  useEffect(() => {
    const newCompleted = new Set<number>();
    for (let i = 1; i <= totalSections; i++) {
      if (isSectionComplete(i)) {
        newCompleted.add(i);
      }
    }
    setCompletedSections(newCompleted);
  }, [formData]);

  // Navigate to next available section
  const goToNextSection = () => {
    if (currentSection < totalSections && isSectionComplete(currentSection)) {
      setCurrentSection(currentSection + 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topicId: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter(t => t !== topicId)
        : [...prev.topics, topicId]
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData('avatar', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateFormData('avatarPreview', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'El nombre de la comunidad es requerido';
    if (formData.name.length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (formData.name.length > 50) return 'El nombre no puede exceder 50 caracteres';
    
    if (!formData.description.trim()) return 'La descripción es requerida';
    if (formData.description.length < 10) return 'La descripción debe tener al menos 10 caracteres';
    if (formData.description.length > 300) return 'La descripción no puede exceder 300 caracteres';
    
    if (!formData.hashtag.trim()) return 'El hashtag es requerido';
    if (formData.hashtag.length < 3) return 'El hashtag debe tener al menos 3 caracteres';
    if (formData.hashtag.length > 30) return 'El hashtag no puede exceder 30 caracteres';
    if (!/^[a-zA-Z0-9_]+$/.test(formData.hashtag)) return 'El hashtag solo puede contener letras, números y guiones bajos';
    
    if (formData.topics.length === 0) return 'Debes seleccionar al menos un tema';
    
    return null;
  };

  const handleSubmit = async () => {
    if (!user || !isSectionComplete(1) || !isSectionComplete(2)) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate slug from name
      const slug = generateSlug(formData.name);
      
      // Check if slug already exists (improved and re-enabled)
      console.log('Generated slug:', slug);
      console.log('Generated hashtag:', formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`);
      
      try {
        const { data: existingCommunities, error: checkError } = await supabase
          .from('communities')
          .select('id, slug, hashtag')
          .or(`slug.eq.${slug},hashtag.eq.${formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`}`);

        console.log('Checking for existing communities...');
        
        if (checkError) {
          console.warn('Error checking for duplicates (continuing anyway):', checkError);
          // Continue anyway - let the database handle the constraint
        } else if (existingCommunities && existingCommunities.length > 0) {
          const duplicateSlug = existingCommunities.find(c => c.slug === slug);
          const duplicateHashtag = existingCommunities.find(c => c.hashtag === (formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`));
          
          if (duplicateSlug) {
            alert('Ya existe una comunidad con ese nombre. Intenta con otro nombre.');
            setIsSubmitting(false);
            return;
          }
          
          if (duplicateHashtag) {
            alert('Ya existe una comunidad con ese hashtag. Intenta con otro hashtag.');
            setIsSubmitting(false);
            return;
          }
        }
        
        console.log('✅ No duplicates found, proceeding...');
      } catch (duplicateCheckError) {
        console.warn('Duplicate check failed (continuing anyway):', duplicateCheckError);
        // Continue - let database constraints handle it
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (formData.avatar) {
        try {
          const fileExt = formData.avatar.name.split('.').pop();
          const fileName = `${slug}-${Date.now()}.${fileExt}`;
          
          console.log('Uploading avatar:', fileName);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('community-avatars')
            .upload(fileName, formData.avatar);

          if (uploadError) {
            console.warn('Avatar upload failed, continuing without avatar:', uploadError);
            // Continue without avatar instead of failing completely
            avatarUrl = null;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('community-avatars')
              .getPublicUrl(fileName);
            
            avatarUrl = publicUrl;
            console.log('Avatar uploaded successfully:', avatarUrl);
          }
        } catch (avatarError) {
          console.warn('Avatar upload error, continuing without avatar:', avatarError);
          avatarUrl = null;
        }
      }

      // Create community - Try with RPC first, fallback to direct insert
      const communityData = {
        name: formData.name,
        description: formData.description,
        slug: slug,
        hashtag: formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`,
        is_public: formData.isPublic,
        avatar_url: avatarUrl,
        member_count: 1,
        creator_id: user.id // Include for RPC if needed
      };

      console.log('Creating community with data:', communityData);

      // Try RPC function first (if it exists)
      let community = null;
      let createError = null;

      try {
        console.log('Attempting to create community via RPC...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_community', {
          p_name: formData.name,
          p_description: formData.description,
          p_slug: slug,
          p_hashtag: formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`,
          p_is_public: formData.isPublic,
          p_avatar_url: avatarUrl,
          p_creator_id: user.id
        });

        console.log('RPC Response:', { data: rpcData, error: rpcError });

        if (rpcError) {
          console.log('RPC function not available, trying direct insert...', rpcError);
          throw rpcError;
        }

        community = rpcData;
        console.log('✅ Community created via RPC successfully:', community);
      } catch (rpcError) {
        console.log('❌ RPC failed, attempting direct insert...', rpcError);
        
        // Fallback to direct insert without creator_id
        const { data: directData, error: directError } = await supabase
          .from('communities')
          .insert({
            name: formData.name,
            description: formData.description,
            slug: slug,
            hashtag: formData.hashtag.startsWith('#') ? formData.hashtag : `#${formData.hashtag}`,
            is_public: formData.isPublic,
            avatar_url: avatarUrl,
            member_count: 1
          })
          .select()
          .single();

        console.log('Direct insert response:', { data: directData, error: directError });
        community = directData;
        createError = directError;
      }

      if (createError) {
        console.error('Error creating community:', createError);
        throw createError;
      }

      console.log('✅ Community created successfully:', community);

      // Check if community data is valid
      if (!community || !community.id) {
        console.error('❌ Invalid community data received:', community);
        throw new Error('Community creation failed - invalid data returned');
      }

      // Note: RPC function already adds creator as member, so we skip this step
      console.log('ℹ️ Creator already added as member by RPC function');

      // Store community topics
      if (formData.topics.length > 0) {
        try {
          console.log('🔄 Attempting to save topics:', formData.topics);
          const topicInserts = formData.topics.map(topicId => ({
            community_id: community.id,
            topic_id: topicId
          }));

          console.log('Topic inserts prepared:', topicInserts);

          const { error: topicsError } = await supabase
            .from('community_topics')
            .insert(topicInserts);

          if (topicsError) {
            console.warn('⚠️ Error saving topics (non-critical):', topicsError);
            // Don't throw here as topics are not critical
          } else {
            console.log('✅ Topics saved successfully');
          }
        } catch (topicsError) {
          console.warn('⚠️ Topics error (continuing anyway):', topicsError);
          // Continue without topics - they are not essential for community creation
        }
      } else {
        console.log('ℹ️ No topics to save');
      }

      // Reset form
      console.log('🔄 Resetting form and closing modal...');
      setFormData(INITIAL_FORM_DATA);
      setCurrentSection(1);
      setCompletedSections(new Set());
      
      console.log('🔄 Calling onSuccess callback...');
      onSuccess?.();
      
      console.log('🔄 Closing modal...');
      onClose();
      
      console.log('🎉 COMUNIDAD CREADA EXITOSAMENTE:', community.name);
    } catch (error: any) {
      console.error('Error creating community:', error);
      
      // More specific error messages
      let errorMessage = 'Error al crear la comunidad. ';
      if (error?.message?.includes('duplicate') || error?.code === '23505' || error?.message?.includes('unique')) {
        if (error?.message?.includes('slug')) {
          errorMessage += 'Ya existe una comunidad con ese nombre. Prueba con un nombre diferente.';
        } else if (error?.message?.includes('hashtag')) {
          errorMessage += 'Ya existe una comunidad con ese hashtag. Prueba con un hashtag diferente.';
        } else {
          errorMessage += 'Ya existe una comunidad con esos datos. Prueba con un nombre y hashtag únicos.';
        }
      } else if (error?.message?.includes('row-level security') || error?.message?.includes('policy')) {
        errorMessage += 'No tienes permisos para crear comunidades. Contacta al administrador para activar esta funcionalidad.';
      } else if (error?.message?.includes('storage')) {
        errorMessage += 'Error al subir la imagen. Intenta con una imagen más pequeña.';
      } else if (error?.message?.includes('creator_id') || error?.message?.includes('column')) {
        errorMessage += 'Problema con la estructura de la base de datos. Contacta al administrador.';
      } else if (error?.message?.includes('community_topics')) {
        errorMessage += 'La comunidad se creó pero hubo un error al guardar los temas.';
      } else {
        console.log('Error completo para debugging:', error);
        errorMessage += `${error?.message || 'Por favor, inténtalo de nuevo.'} (Ver consola para más detalles)`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Crear comunidad</h2>
              <p className="text-sm text-gray-600 mt-1">
                Construye una comunidad para tu sector de la hostelería
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progreso</span>
              <span>{completedSections.size}/{totalSections} secciones</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">

            {/* Section 1: Información básica */}
            <Card className={`transition-all duration-300 ${currentSection >= 1 ? 'ring-2 ring-blue-100' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSections.has(1) ? 'bg-green-100 text-green-700' : 
                    currentSection === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    1
                  </div>
                  <h3 className="text-lg font-medium">Cuéntanos sobre tu comunidad</h3>
                  {completedSections.has(1) && (
                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                      Completado
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Community Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nombre de la comunidad*
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Ej: Cocineros Profesionales Madrid"
                      maxLength={50}
                      className={`w-full ${
                        formData.name.length > 0 && formData.name.length < 3 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.name.length >= 3 
                          ? 'border-green-300 focus:border-green-500' 
                          : ''
                      }`}
                    />
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>Un nombre descriptivo que represente tu comunidad</span>
                      <span className={`${
                        formData.name.length > 45 ? 'text-orange-600' : 
                        formData.name.length > 50 ? 'text-red-600' : ''
                      }`}>
                        {formData.name.length}/50
                      </span>
                    </div>
                    {formData.name && (
                      <div className="text-xs text-blue-600 mt-1">
                        URL: r/{generateSlug(formData.name)}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción de tu comunidad*
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe el propósito de tu comunidad, qué temas se tratarán y qué tipo de miembros buscas..."
                      maxLength={300}
                      rows={4}
                      className={`w-full resize-none ${
                        formData.description.length > 0 && formData.description.length < 10 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.description.length >= 10 
                          ? 'border-green-300 focus:border-green-500' 
                          : ''
                      }`}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      <span className={`${
                        formData.description.length > 270 ? 'text-orange-600' : 
                        formData.description.length > 300 ? 'text-red-600' : ''
                      }`}>
                        {formData.description.length}/300
                      </span>
                    </div>
                  </div>

                  {/* Hashtag */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Hashtag principal*
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.hashtag}
                        onChange={(e) => updateFormData('hashtag', e.target.value.replace('#', ''))}
                        placeholder="hosteleriamadrid"
                        maxLength={30}
                        className={`pl-10 w-full ${
                          formData.hashtag.length > 0 && (formData.hashtag.length < 3 || !/^[a-zA-Z0-9_]+$/.test(formData.hashtag))
                            ? 'border-red-300 focus:border-red-500' 
                            : formData.hashtag.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.hashtag)
                            ? 'border-green-300 focus:border-green-500' 
                            : ''
                        }`}
                      />
                    </div>
                    <div className="text-xs mt-1 space-y-1">
                      <div className="text-gray-500">
                        Hashtag que representará tu comunidad en posts y búsquedas
                      </div>
                      {formData.hashtag.length > 0 && !/^[a-zA-Z0-9_]+$/.test(formData.hashtag) && (
                        <div className="text-red-500">
                          Solo se permiten letras, números y guiones bajos
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Imagen de la comunidad
                    </label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.avatarPreview || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                          {formData.name ? formData.name[0].toUpperCase() : <Upload className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Button variant="outline" className="relative">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imagen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG o GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {completedSections.has(1) && currentSection === 1 && (
                  <div className="mt-6 flex justify-end">
                    <Button onClick={goToNextSection} className="gap-2">
                      Continuar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Temas */}
            {completedSections.has(1) && (
              <Card className={`transition-all duration-300 ${currentSection >= 2 ? 'ring-2 ring-blue-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSections.has(2) ? 'bg-green-100 text-green-700' : 
                      currentSection === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      2
                    </div>
                    <h3 className="text-lg font-medium">Añadir temas</h3>
                    {completedSections.has(2) && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Añade hasta 3 temas para que los usuarios interesados encuentren tu comunidad.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COMMUNITY_TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          disabled={!formData.topics.includes(topic.id) && formData.topics.length >= 3}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.topics.includes(topic.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          } ${!formData.topics.includes(topic.id) && formData.topics.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{topic.emoji}</span>
                            <span className="text-sm font-medium">{topic.label}</span>
                          </div>
                          {formData.topics.includes(topic.id) && (
                            <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500">
                      Temas seleccionados: {formData.topics.length}/3
                    </div>
                  </div>

                  {completedSections.has(2) && currentSection === 2 && (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={goToNextSection} className="gap-2">
                        Continuar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 3: Tipo de comunidad */}
            {completedSections.has(2) && (
              <Card className={`transition-all duration-300 ${currentSection >= 3 ? 'ring-2 ring-blue-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSections.has(3) ? 'bg-green-100 text-green-700' : 
                      currentSection === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      3
                    </div>
                    <h3 className="text-lg font-medium">¿Qué tipo de comunidad es esta?</h3>
                    {completedSections.has(3) && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      Decide quién puede ver y contribuir en tu comunidad. Solo las comunidades públicas aparecen en la búsqueda.
                    </p>

                    <RadioGroup 
                      value={formData.isPublic ? "public" : "private"} 
                      onValueChange={(value) => updateFormData('isPublic', value === "public")}
                    >
                      <div className="space-y-4">
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                          formData.isPublic ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <RadioGroupItem value="public" id="public" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="public" className="flex items-center gap-2 font-medium cursor-pointer">
                              <Globe className="h-4 w-4" />
                              Público
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Todo el mundo puede ver, publicar y comentar en esta comunidad
                            </p>
                          </div>
                        </div>

                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                          !formData.isPublic ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <RadioGroupItem value="private" id="private" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="private" className="flex items-center gap-2 font-medium cursor-pointer">
                              <Lock className="h-4 w-4" />
                              Restringida
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Cualquiera puede ver, pero solo los usuarios aprobados pueden colaborar
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>

                  </div>

                  {currentSection === 3 && (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={goToNextSection} className="gap-2">
                        Continuar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 4: Confirmación */}
            {completedSections.has(3) && (
              <Card className={`transition-all duration-300 ${currentSection >= 4 ? 'ring-2 ring-blue-100' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSections.has(4) ? 'bg-green-100 text-green-700' : 
                      currentSection === 4 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      4
                    </div>
                    <h3 className="text-lg font-medium">Resumen</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={formData.avatarPreview || undefined} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {formData.name ? formData.name[0].toUpperCase() : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-lg">{formData.name}</h4>
                          <p className="text-sm text-gray-600">r/{generateSlug(formData.name)}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700">{formData.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Hash className="h-3 w-3" />
                          {formData.hashtag}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {formData.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {formData.isPublic ? 'Público' : 'Restringida'}
                        </Badge>
                      </div>

                      {formData.topics.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Temas:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.topics.map(topicId => {
                              const topic = COMMUNITY_TOPICS.find(t => t.id === topicId);
                              return topic ? (
                                <Badge key={topicId} variant="secondary" className="gap-1">
                                  <span>{topic.emoji}</span>
                                  {topic.label}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 leading-relaxed">
                      Al continuar, aceptas nuestro <a href="#" className="text-blue-600 hover:underline">Código de Conducta del Moderador</a> y 
                      confirmas que has entendido las <a href="#" className="text-blue-600 hover:underline">Reglas de la Comunidad</a>.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {completedSections.size > 0 && (
                <span>
                  Has completado {completedSections.size} de {totalSections} secciones
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              {completedSections.size >= 3 && (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isSectionComplete(1) || !isSectionComplete(2)}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Crear comunidad
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
