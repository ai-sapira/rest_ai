import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Progress, 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Textarea,
  Badge, 
  Grid, 
  GridItem,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  useToast,
  Divider,
  Icon,
  Flex,
  Spacer
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { FiPackage, FiMapPin, FiDollarSign, FiUpload, FiPhone, FiChevronRight, FiX, FiImage, FiCamera } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAnuncios } from '@/hooks/useAnuncios';

interface FormData {
  type: 'vendo' | 'busco' | 'alquiler' | 'servicio' | null;
  // Subtipo de servicio
  serviceType: 'ofrezco' | 'busco' | null;
  // Subtipo de alquiler
  rentalType: 'ofrezco' | 'busco' | null;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  // Campos para productos
  state: string;
  price: string;
  currency: string;
  // Campos para alquileres
  rentalPriceDay: string;
  rentalPriceWeek: string;
  rentalPriceMonth: string;
  dimensions: {
    width: string;
    height: string;
    depth: string;
  };
  shipping: boolean;
  // Campos para servicios
  experienceYears: string;
  availability: string;
  salaryMin: string;
  salaryMax: string;
  salaryType: string;
  specialties: string[];
  certifications: string[];
  languages: string[];
  schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  references: string;
  portfolio: string; // URL del portfolio o descripción de trabajos anteriores
  // Ubicación (común para ambos)
  location: {
    region: string;
    province: string;
    city: string;
  };
  images: File[];
}

const INITIAL_FORM_DATA: FormData = {
  type: null,
  serviceType: null,
  rentalType: null,
  category: '',
  subcategory: '',
  title: '',
  description: '',
  // Campos para productos
  state: '',
  price: '',
  currency: 'EUR',
  // Campos para alquileres
  rentalPriceDay: '',
  rentalPriceWeek: '',
  rentalPriceMonth: '',
  dimensions: { width: '', height: '', depth: '' },
  shipping: false,
  // Campos para servicios
  experienceYears: '',
  availability: '',
  salaryMin: '',
  salaryMax: '',
  salaryType: 'hora',
  specialties: [],
  certifications: [],
  languages: [],
  schedule: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  },
  references: '',
  portfolio: '',
  // Común
  location: { region: '', province: '', city: '' },
  images: []
};

const MAQUINARIA_SUBCATEGORIES = [
  'Hornos',
  'Freidoras', 
  'Planchas',
  'Lavavajillas',
  'Refrigeración',
  'Cafeteras',
  'Batidoras/Mezcladoras',
  'Cortadoras/Rebanadoras',
  'Otros equipos'
];

const SERVICIOS_SUBCATEGORIES = [
  'Chef / Cocinero',
  'Camarero / Mesero',
  'Barista',
  'Sommelier',
  'Ayudante de Cocina',
  'Personal de Limpieza',
  'Recepcionista',
  'Gerente de Restaurante',
  'Nutricionista',
  'Otros servicios'
];

const AVAILABILITY_OPTIONS = [
  'Tiempo completo',
  'Medio tiempo',
  'Fines de semana',
  'Noches',
  'Días específicos',
  'Por horas',
  'Temporal/Estacional',
  'Eventos especiales'
];

const SALARY_TYPES = [
  { value: 'hora', label: 'Por hora' },
  { value: 'dia', label: 'Por día' },
  { value: 'mes', label: 'Por mes' },
  { value: 'año', label: 'Por año' },
  { value: 'proyecto', label: 'Por proyecto' }
];

const COMMON_SPECIALTIES = [
  'Cocina mediterránea',
  'Cocina italiana',
  'Cocina francesa',
  'Cocina asiática',
  'Repostería',
  'Pastelería',
  'Panadería',
  'Cocina vegana',
  'Cocina sin gluten',
  'Maridajes',
  'Cócteles',
  'Café especialidad',
  'Latte art',
  'Catación',
  'Protocolo',
  'Idiomas',
  'Gestión de equipos',
  'Control de calidad'
];

const COMMON_LANGUAGES = [
  'Español',
  'Inglés',
  'Francés',
  'Italiano',
  'Alemán',
  'Portugués',
  'Catalán',
  'Euskera',
  'Gallego',
  'Árabe',
  'Chino',
  'Japonés'
];

const PRODUCT_STATES = [
  'nuevo',
  'como nuevo',
  'usado'
];

const SPANISH_REGIONS = [
  'Andalucía',
  'Aragón', 
  'Asturias',
  'Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'Madrid',
  'Murcia',
  'Navarra',
  'País Vasco',
  'La Rioja',
  'Ceuta',
  'Melilla'
];


export default function CrearAnuncio() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { createAnuncio } = useAnuncios();

  // Helper to detect if current flow is servicios
  const isServiciosCategory = formData.type === 'servicio';
  
  const getTypeOptions = () => {
    return [
      { id: 'vendo', label: 'Vendo', icon: FiPackage, description: 'Algo que ya no necesito' },
      { id: 'busco', label: 'Busco', icon: FiMapPin, description: 'Algo que necesito' },
      { id: 'alquiler', label: 'Alquiler', icon: FiDollarSign, description: 'Alquiler de equipamiento' },
      { id: 'servicio', label: 'Servicios', icon: FiDollarSign, description: 'Servicios profesionales' }
    ];
  };

  // Progress calculation
  const totalSections = isServiciosCategory ? 7 : 5; // 7 sections for servicios, 5 for products
  const progress = (completedSections.size / totalSections) * 100;

  // Section validation
  const isSectionComplete = (section: number): boolean => {
    const result = (() => {
    switch (section) {
      case 1: // Tipo de anuncio
        if (formData.type === 'alquiler') {
          return !!(formData.type && formData.rentalType);
        }
        if (formData.type === 'servicio') {
          return !!(formData.type && formData.serviceType);
        }
        return !!formData.type;
      case 2: // Información básica
        return !!(formData.title && formData.description && formData.subcategory);
      case 3: // Detalles del producto/servicio
        if (isServiciosCategory) {
          return !!(formData.experienceYears && formData.availability && (formData.salaryMin || formData.salaryMax));
        }
        if (formData.type === 'busco') return !!formData.state;
        if (formData.type === 'alquiler') {
          if (formData.rentalType === 'ofrezco') {
            return !!(formData.state && (
              formData.rentalPriceDay || 
              formData.rentalPriceWeek || 
              formData.rentalPriceMonth
            ));
          }
          if (formData.rentalType === 'busco') {
            return !!(formData.state && formData.rentalPriceMonth);
          }
        }
        return !!(formData.state && formData.price);
      case 4: // Fotos
        return formData.images.length > 0 || 
               formData.type === 'busco' || 
               (formData.type === 'servicio' && formData.serviceType === 'busco');
      case 5: // Ubicación
        return !!(formData.location.region && formData.location.province && formData.location.city);
      case 6: // Especialidades y certificaciones (solo servicios)
        if (isServiciosCategory) {
          return formData.specialties.length > 0 || formData.certifications.length > 0;
        }
        return false;
      case 7: // Horarios y referencias (solo servicios)
        if (isServiciosCategory) {
          return !!formData.references; // At least references should be filled
        }
        return false;
      default:
        return false;
    }
    })();
    console.log(`🔍 Section ${section} validation:`, result, {
      type: formData.type,
      serviceType: formData.serviceType,
      rentalType: formData.rentalType,
      title: formData.title,
      description: formData.description,
      subcategory: formData.subcategory
    });
    return result;
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

  // Auto-set category when type is selected
  useEffect(() => {
    if (formData.type === 'servicio') {
      setFormData(prev => ({ ...prev, category: 'servicios' }));
    } else if (formData.type === 'vendo' || formData.type === 'busco') {
      setFormData(prev => ({ ...prev, category: 'maquinaria' }));
    }
  }, [formData.type]);

  // Navigate to next available section
  const goToNextSection = () => {
    if (currentSection < totalSections && isSectionComplete(currentSection)) {
      setCurrentSection(currentSection + 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (field: keyof FormData, nestedField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev[field] as any), [nestedField]: value }
    }));
  };

  // Helper functions for array fields (specialties, certifications, languages)
  const addToArray = (field: 'specialties' | 'certifications' | 'languages', value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeFromArray = (field: 'specialties' | 'certifications' | 'languages', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const currentImages = formData.images || [];
      const totalImages = currentImages.length + newFiles.length;
      
      if (totalImages > 6) {
        toast({
          title: "Límite de imágenes",
          description: "Solo puedes subir máximo 6 imágenes.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      updateFormData('images', [...currentImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePublish = async () => {
    console.log('🔥 handlePublish called!');
    console.log('📊 Completed sections:', completedSections.size, 'of', totalSections);
    console.log('📋 Form data:', formData);
    try {
      console.log('Iniciando publicación de anuncio...', formData);
      
      // Transform form data to match the database schema
      const baseData = {
        tipo: isServiciosCategory ? 
          (formData.serviceType === 'ofrezco' ? 'oferta' as const : 'busco_servicio' as const) :
          formData.type === 'alquiler' ? 
            (formData.rentalType === 'ofrezco' ? 'alquilo' as const : 'busco_alquiler' as const) :
            formData.type === 'busco' ? 'compro' as const :
            formData.type as 'vendo',
        categoria: isServiciosCategory ? 'servicios' : 'maquinaria',
        subcategoria: formData.subcategory,
        titulo: formData.title,
        descripcion: formData.description,
        estado_producto: isServiciosCategory ? 'nuevo' : (formData.state || 'nuevo'), // Always provide a value
        moneda: formData.currency || 'EUR',
        ubicacion: {
          region: formData.location.region,
          province: formData.location.province,
          city: formData.location.city
        },
        imagenes: [],
        envio: formData.shipping
      };

      // Add product-specific fields only for non-services
      if (!isServiciosCategory) {
        Object.assign(baseData, {
          ...(formData.price && { precio: parseFloat(formData.price) }),
          ...(formData.rentalPriceDay && { precio_alquiler_dia: parseFloat(formData.rentalPriceDay) }),
          ...(formData.rentalPriceWeek && { precio_alquiler_semana: parseFloat(formData.rentalPriceWeek) }),
          ...(formData.rentalPriceMonth && { precio_alquiler_mes: parseFloat(formData.rentalPriceMonth) }),
          ...(formData.dimensions.width || formData.dimensions.height || formData.dimensions.depth ? {
            dimensiones: {
              ...(formData.dimensions.width && { width: formData.dimensions.width }),
              ...(formData.dimensions.height && { height: formData.dimensions.height }),
              ...(formData.dimensions.depth && { depth: formData.dimensions.depth })
            }
          } : {})
        });
      }

      // Add service-specific fields only for services
      if (isServiciosCategory) {
        Object.assign(baseData, {
          ...(formData.experienceYears && { experiencia_anos: parseInt(formData.experienceYears) }),
          ...(formData.availability && { disponibilidad: formData.availability }),
          ...(formData.salaryMin && { salario_min: parseFloat(formData.salaryMin) }),
          ...(formData.salaryMax && { salario_max: parseFloat(formData.salaryMax) }),
          ...(formData.salaryType && { tipo_salario: formData.salaryType as 'hora' | 'dia' | 'mes' | 'año' | 'proyecto' }),
          ...(formData.specialties.length > 0 && { especialidades: formData.specialties }),
          ...(formData.certifications.length > 0 && { certificaciones: formData.certifications }),
          ...(formData.languages.length > 0 && { idiomas: formData.languages }),
          ...(Object.values(formData.schedule).some(day => day) && {
            disponibilidad_horario: Object.fromEntries(
              Object.entries({
                lunes: formData.schedule.monday,
                martes: formData.schedule.tuesday,
                miercoles: formData.schedule.wednesday,
                jueves: formData.schedule.thursday,
                viernes: formData.schedule.friday,
                sabado: formData.schedule.saturday,
                domingo: formData.schedule.sunday
              }).filter(([_, value]) => value) // Solo incluir días con horarios
            )
          }),
          ...(formData.references && { referencias: formData.references }),
          ...(formData.portfolio && { portfolio: formData.portfolio })
        });
      }

      const anuncioData = baseData;

      console.log('Datos del anuncio preparados:', anuncioData);
      console.log('🔍 Enviando a Supabase:', JSON.stringify(anuncioData, null, 2));

      // Use the hook to create the anuncio
      const result = await createAnuncio(anuncioData);
      
      if (result) {
        toast({
          title: "¡Anuncio publicado!",
          description: "Tu anuncio ha sido creado exitosamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Redirect to announcements list
        navigate('/platform/mis-anuncios');
      } else {
        throw new Error('No se pudo crear el anuncio');
      }
    } catch (error) {
      console.error('Error creating anuncio:', error);
      toast({
        title: "Error",
        description: `Hubo un problema al crear el anuncio: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" position="sticky" top="0" zIndex="10">
        <Container maxW="container.xl" py={6}>
          <VStack spacing={4} align="stretch">
            {/* Navigation Row */}
            <Flex align="center">
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={handleGoBack}
                size="sm"
                colorScheme="gray"
                _hover={{ bg: "gray.100" }}
              >
                Volver
              </Button>
            </Flex>
            
            {/* Title and Progress Row */}
            <Flex align="center" justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="xl" fontWeight="700" color="gray.900">
                  Crear anuncio
                </Heading>
                <Text fontSize="md" color="gray.600" fontWeight="400">
                  Completa la información paso a paso para publicar tu anuncio
                </Text>
              </VStack>
              
              <VStack align="end" spacing={2}>
                <Text fontSize="sm" color="gray.600" fontWeight="600">
                  {completedSections.size} de {totalSections} secciones completadas
                </Text>
                <Box w="200px">
                  <Progress 
                    value={progress} 
                    size="md" 
                    colorScheme="orange" 
                    borderRadius="full"
                    bg="gray.200"
                    sx={{
                      '& > div': {
                        background: 'linear-gradient(90deg, #f56500 0%, #ea580c 100%)',
                      }
                    }}
                  />
                </Box>
                <Text fontSize="xs" color="gray.500">
                  {Math.round(progress)}% completado
                </Text>
              </VStack>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">

          {/* Section 1: Tipo de anuncio */}
          <Card
            bg="white"
            shadow={currentSection >= 1 ? "lg" : "sm"}
            borderWidth={currentSection >= 1 ? "2px" : "1px"}
            borderColor={currentSection >= 1 ? "orange.200" : "gray.200"}
            transition="all 0.3s"
          >
            <CardBody p={8}>
              <HStack mb={6} spacing={4}>
                <Flex
                  w={10}
                  h={10}
                  borderRadius="full"
                  align="center"
                  justify="center"
                  fontSize="sm"
                  fontWeight="600"
                  bg={completedSections.has(1) ? "green.100" : currentSection === 1 ? "orange.100" : "gray.100"}
                  color={completedSections.has(1) ? "green.700" : currentSection === 1 ? "orange.700" : "gray.500"}
                >
                  {completedSections.has(1) ? <CheckIcon /> : "1"}
                </Flex>
                <Heading size="md" color="gray.800" fontWeight="600">
                  ¿Qué vas a hacer?
                </Heading>
                {completedSections.has(1) && (
                  <Badge colorScheme="green" variant="subtle" fontWeight="500">
                    Completado
                  </Badge>
                )}
              </HStack>

              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                {getTypeOptions().map((option) => (
                  <GridItem key={option.id}>
                    <Card
                      as="button"
                      onClick={() => {
                        updateFormData('type', option.id);
                        if (option.id !== 'alquiler' && currentSection === 1) goToNextSection();
                      }}
                      borderWidth="2px"
                      borderColor={formData.type === option.id ? "orange.400" : "gray.200"}
                      bg={formData.type === option.id ? "orange.50" : "white"}
                      _hover={{ borderColor: "orange.300", bg: formData.type === option.id ? "orange.50" : "gray.50" }}
                      transition="all 0.2s"
                      cursor="pointer"
                      textAlign="center"
                      w="full"
                      h="120px"
                    >
                      <CardBody py={6} h="full" display="flex" flexDirection="column" justifyContent="center">
                        <Icon
                          as={option.icon}
                          w={8}
                          h={8}
                          mb={3}
                          color={formData.type === option.id ? "orange.600" : "gray.400"}
                        />
                        <Text fontWeight="600" fontSize="sm" mb={1}>
                          {option.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {option.description}
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))}
              </Grid>

              {/* Subtipo de alquiler */}
              {formData.type === 'alquiler' && (
                <VStack spacing={4} mt={6}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    ¿Qué tipo de alquiler?
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                    <GridItem>
                      <Card
                        as="button"
                        onClick={() => {
                          updateFormData('rentalType', 'ofrezco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        borderWidth="2px"
                        borderColor={formData.rentalType === 'ofrezco' ? "green.400" : "gray.200"}
                        bg={formData.rentalType === 'ofrezco' ? "green.50" : "white"}
                        _hover={{ borderColor: "green.300", bg: formData.rentalType === 'ofrezco' ? "green.50" : "gray.50" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        textAlign="center"
                        w="full"
                        h="100px"
                      >
                        <CardBody py={4} h="full" display="flex" flexDirection="column" justifyContent="center">
                          <Icon
                            as={FiDollarSign}
                            w={6}
                            h={6}
                            mb={2}
                            color={formData.rentalType === 'ofrezco' ? "green.600" : "gray.400"}
                          />
                          <Text fontWeight="600" fontSize="sm" mb={1}>
                            Ofrezco en alquiler
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Tengo equipamiento para alquilar
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                    
                    <GridItem>
                      <Card
                        as="button"
                        onClick={() => {
                          updateFormData('rentalType', 'busco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        borderWidth="2px"
                        borderColor={formData.rentalType === 'busco' ? "orange.400" : "gray.200"}
                        bg={formData.rentalType === 'busco' ? "orange.50" : "white"}
                        _hover={{ borderColor: "orange.300", bg: formData.rentalType === 'busco' ? "orange.50" : "gray.50" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        textAlign="center"
                        w="full"
                        h="100px"
                      >
                        <CardBody py={4} h="full" display="flex" flexDirection="column" justifyContent="center">
                          <Icon
                            as={FiMapPin}
                            w={6}
                            h={6}
                            mb={2}
                            color={formData.rentalType === 'busco' ? "orange.600" : "gray.400"}
                          />
                          <Text fontWeight="600" fontSize="sm" mb={1}>
                            Busco para alquilar
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Necesito equipamiento en alquiler
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </VStack>
              )}

              {/* Subtipo de servicio */}
              {formData.type === 'servicio' && (
                <VStack spacing={4} mt={6}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    ¿Qué tipo de servicio?
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                    <GridItem>
                      <Card
                        as="button"
                        onClick={() => {
                          updateFormData('serviceType', 'ofrezco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        borderWidth="2px"
                        borderColor={formData.serviceType === 'ofrezco' ? "orange.400" : "gray.200"}
                        bg={formData.serviceType === 'ofrezco' ? "orange.50" : "white"}
                        _hover={{ borderColor: "orange.300", bg: formData.serviceType === 'ofrezco' ? "orange.50" : "gray.50" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        textAlign="center"
                        w="full"
                        h="100px"
                      >
                        <CardBody py={4} h="full" display="flex" flexDirection="column" justifyContent="center">
                          <Icon
                            as={FiDollarSign}
                            w={6}
                            h={6}
                            mb={2}
                            color={formData.serviceType === 'ofrezco' ? "orange.600" : "gray.400"}
                          />
                          <Text fontWeight="600" fontSize="sm" mb={1}>
                            Ofrezco servicio
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Tengo un servicio profesional para ofrecer
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                    
                    <GridItem>
                      <Card
                        as="button"
                        onClick={() => {
                          updateFormData('serviceType', 'busco');
                          if (currentSection === 1) goToNextSection();
                        }}
                        borderWidth="2px"
                        borderColor={formData.serviceType === 'busco' ? "orange.400" : "gray.200"}
                        bg={formData.serviceType === 'busco' ? "orange.50" : "white"}
                        _hover={{ borderColor: "orange.300", bg: formData.serviceType === 'busco' ? "orange.50" : "gray.50" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        textAlign="center"
                        w="full"
                        h="100px"
                      >
                        <CardBody py={4} h="full" display="flex" flexDirection="column" justifyContent="center">
                          <Icon
                            as={FiMapPin}
                            w={6}
                            h={6}
                            mb={2}
                            color={formData.serviceType === 'busco' ? "orange.600" : "gray.400"}
                          />
                          <Text fontWeight="600" fontSize="sm" mb={1}>
                            Busco servicio
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Necesito contratar un servicio profesional
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </VStack>
              )}

              {completedSections.has(1) && currentSection === 1 && (
                <Flex justify="end" mt={6}>
                  <Button colorScheme="orange" onClick={goToNextSection} rightIcon={<Icon as={FiChevronRight} />}>
                    Continuar
                  </Button>
                </Flex>
              )}
            </CardBody>
          </Card>

          {/* Section 2: Información básica - Solo visible si Section 1 está completa */}
          {completedSections.has(1) && (
            <Card
              bg="white"
              shadow={currentSection >= 2 ? "lg" : "sm"}
              borderWidth={currentSection >= 2 ? "2px" : "1px"}
              borderColor={currentSection >= 2 ? "orange.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(2) ? "green.100" : currentSection === 2 ? "orange.100" : "gray.100"}
                    color={completedSections.has(2) ? "green.700" : currentSection === 2 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(2) ? <CheckIcon /> : "2"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    Información del producto
                  </Heading>
                  {completedSections.has(2) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {/* Subcategoría */}
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Categoría y subcategoría
                      </FormLabel>
                      <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>
                        <SelectTrigger className="h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {(isServiciosCategory ? SERVICIOS_SUBCATEGORIES : MAQUINARIA_SUBCATEGORIES).map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                  {/* Título */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Título
                    </FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Ej: Horno industrial marca Rational..."
                      maxLength={80}
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                    <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                      {formData.title.length}/80
                    </Text>
                  </FormControl>

                  {/* Descripción */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Descripción
                    </FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe el producto con el máximo detalle posible..."
                      maxLength={500}
                      rows={4}
                      resize="none"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                    <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                      {formData.description.length}/500
                    </Text>
                  </FormControl>
                </VStack>

                  {completedSections.has(2) && currentSection === 2 && (
                    <Flex justify="end" mt={6}>
                      <Button colorScheme="orange" onClick={goToNextSection} rightIcon={<Icon as={FiChevronRight} />}>
                        Continuar
                      </Button>
                    </Flex>
                  )}
              </CardBody>
            </Card>
          )}

          {/* Section 3: Detalles del producto - Solo visible si Section 2 está completa */}
          {completedSections.has(2) && (
            <Card
              bg="white"
              shadow={currentSection >= 3 ? "lg" : "sm"}
              borderWidth={currentSection >= 3 ? "2px" : "1px"}
              borderColor={currentSection >= 3 ? "orange.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(3) ? "green.100" : currentSection === 3 ? "orange.100" : "gray.100"}
                    color={completedSections.has(3) ? "green.700" : currentSection === 3 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(3) ? <CheckIcon /> : "3"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    {isServiciosCategory ? 'Detalles del servicio' : 'Detalles del producto'}
                  </Heading>
                  {completedSections.has(3) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {isServiciosCategory ? (
                    // Campos específicos para servicios
                    <>
                      {/* Años de experiencia */}
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Años de experiencia
                        </FormLabel>
                        <NumberInput
                          value={formData.experienceYears}
                          min={0}
                          max={50}
                        >
                          <NumberInputField
                            onChange={(e) => updateFormData('experienceYears', e.target.value)}
                            placeholder="Ej: 5"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                      </FormControl>

                      {/* Disponibilidad */}
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Disponibilidad
                        </FormLabel>
                        <Select value={formData.availability} onValueChange={(value) => updateFormData('availability', value)}>
                          <SelectTrigger className="h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                            <SelectValue placeholder="Selecciona tu disponibilidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABILITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      {/* Rango salarial */}
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Rango salarial esperado
                        </FormLabel>
                        <VStack spacing={3} align="stretch">
                          <HStack spacing={3}>
                            <NumberInput flex={1}>
                              <NumberInputField
                                value={formData.salaryMin}
                                onChange={(e) => updateFormData('salaryMin', e.target.value)}
                                placeholder="Mínimo"
                                bg="white"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                              />
                            </NumberInput>
                            <Text color="gray.500">-</Text>
                            <NumberInput flex={1}>
                              <NumberInputField
                                value={formData.salaryMax}
                                onChange={(e) => updateFormData('salaryMax', e.target.value)}
                                placeholder="Máximo"
                                bg="white"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                              />
                            </NumberInput>
                          </HStack>
                          <Select value={formData.salaryType} onValueChange={(value) => updateFormData('salaryType', value)}>
                            <SelectTrigger className="h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SALARY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </VStack>
                      </FormControl>
                    </>
                  ) : (
                    // Campos para productos (existente)
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Estado
                      </FormLabel>
                      <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                        <SelectTrigger className="h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  )}

                  {/* Dimensiones */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Medidas del producto
                    </FormLabel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                      <GridItem>
                        <NumberInput>
                          <NumberInputField
                            value={formData.dimensions.width}
                            onChange={(e) => updateNestedFormData('dimensions', 'width', e.target.value)}
                            placeholder="Ancho en cm"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                      </GridItem>
                      <GridItem>
                        <NumberInput>
                          <NumberInputField
                            value={formData.dimensions.height}
                            onChange={(e) => updateNestedFormData('dimensions', 'height', e.target.value)}
                            placeholder="Alto en cm"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                      </GridItem>
                      <GridItem>
                        <NumberInput>
                          <NumberInputField
                            value={formData.dimensions.depth}
                            onChange={(e) => updateNestedFormData('dimensions', 'depth', e.target.value)}
                            placeholder="Fondo en cm"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                      </GridItem>
                    </Grid>
                  </FormControl>

                  {/* Precio de venta/compra */}
                  {(formData.type === 'vendo' || (formData.type === 'servicio' && formData.serviceType === 'ofrezco')) && (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        {formData.type === 'vendo' ? 'Precio de venta' : 'Precio por hora'}
                      </FormLabel>
                      <HStack spacing={3}>
                        <NumberInput flex={1}>
                          <NumberInputField
                            value={formData.price}
                            onChange={(e) => updateFormData('price', e.target.value)}
                            placeholder="0"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                          <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                            <SelectTrigger className="w-20 h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">€</SelectItem>
                              <SelectItem value="USD">$</SelectItem>
                            </SelectContent>
                          </Select>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Sé razonable con el precio
                      </Text>
                    </FormControl>
                  )}

                  {/* Precios de alquiler */}
                  {formData.type === 'alquiler' && formData.rentalType === 'ofrezco' && (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Precios de alquiler
                      </FormLabel>
                      <VStack spacing={3} align="stretch">
                        <HStack spacing={3}>
                          <Text fontSize="xs" color="gray.600" minW="60px">Por día</Text>
                          <NumberInput flex={1}>
                            <NumberInputField
                              value={formData.rentalPriceDay}
                              onChange={(e) => updateFormData('rentalPriceDay', e.target.value)}
                              placeholder="45"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                            />
                          </NumberInput>
                          <Text fontSize="sm" color="gray.500">€/día</Text>
                        </HStack>
                        
                        <HStack spacing={3}>
                          <Text fontSize="xs" color="gray.600" minW="60px">Por semana</Text>
                          <NumberInput flex={1}>
                            <NumberInputField
                              value={formData.rentalPriceWeek}
                              onChange={(e) => updateFormData('rentalPriceWeek', e.target.value)}
                              placeholder="280"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                            />
                          </NumberInput>
                          <Text fontSize="sm" color="gray.500">€/semana</Text>
                        </HStack>
                        
                        <HStack spacing={3}>
                          <Text fontSize="xs" color="gray.600" minW="60px">Por mes</Text>
                          <NumberInput flex={1}>
                            <NumberInputField
                              value={formData.rentalPriceMonth}
                              onChange={(e) => updateFormData('rentalPriceMonth', e.target.value)}
                              placeholder="950"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                            />
                          </NumberInput>
                          <Text fontSize="sm" color="gray.500">€/mes</Text>
                        </HStack>
                      </VStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Completa al menos uno de los precios
                      </Text>
                    </FormControl>
                  )}

                  {/* Presupuesto para busco_alquiler */}
                  {formData.type === 'alquiler' && formData.rentalType === 'busco' && (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Presupuesto máximo mensual
                      </FormLabel>
                      <HStack spacing={3}>
                        <NumberInput flex={1}>
                          <NumberInputField
                            value={formData.rentalPriceMonth}
                            onChange={(e) => updateFormData('rentalPriceMonth', e.target.value)}
                            placeholder="600"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </NumberInput>
                        <Text fontSize="sm" color="gray.500">€/mes</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Indica tu presupuesto mensual máximo
                      </Text>
                    </FormControl>
                  )}
                </VStack>

                {completedSections.has(3) && currentSection === 3 && (
                  <Flex justify="end" mt={6}>
                    <Button colorScheme="orange" onClick={goToNextSection} rightIcon={<Icon as={FiChevronRight} />}>
                      Continuar
                    </Button>
                  </Flex>
                )}
              </CardBody>
            </Card>
          )}

          {/* Section 4: Fotos - Solo visible si Section 3 está completa */}
          {completedSections.has(3) && (
            <Card
              bg="white"
              shadow={currentSection >= 4 ? "lg" : "sm"}
              borderWidth={currentSection >= 4 ? "2px" : "1px"}
              borderColor={currentSection >= 4 ? "blue.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(4) ? "green.100" : currentSection === 4 ? "orange.100" : "gray.100"}
                    color={completedSections.has(4) ? "green.700" : currentSection === 4 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(4) ? <CheckIcon /> : "4"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    Fotos
                  </Heading>
                  {completedSections.has(4) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {formData.type !== 'busco' && (
                    <>
                      {/* Upload Area */}
                      <Box
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="orange.300"
                        borderRadius="lg"
                        p={8}
                        textAlign="center"
                        bg="orange.50"
                        cursor="pointer"
                        _hover={{ bg: "orange.100", borderColor: "orange.400" }}
                        transition="all 0.2s"
                        position="relative"
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                        <Icon as={FiCamera} w={12} h={12} color="orange.500" mb={4} />
                        <Heading size="sm" color="orange.700" mb={2}>
                          Arrastra tus fotos aquí
                        </Heading>
                        <Text fontSize="sm" color="orange.600" mb={2}>
                          Formatos aceptados: JPEG, PNG y WebP. Tamaño límite: 10 MB por archivo.
                        </Text>
                        <Text fontSize="xs" color="orange.500">
                          Máximo 6 imágenes
                        </Text>
                      </Box>

                      {/* Image Preview Grid */}
                      {formData.images && formData.images.length > 0 && (
                        <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4}>
                          {formData.images.map((file, index) => (
                            <GridItem key={index}>
                              <Box position="relative" borderRadius="md" overflow="hidden" bg="gray.100" aspectRatio="1">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                                <Button
                                  position="absolute"
                                  top="2"
                                  right="2"
                                  size="xs"
                                  colorScheme="red"
                                  borderRadius="full"
                                  onClick={() => removeImage(index)}
                                  w={6}
                                  h={6}
                                  minW={6}
                                  p={0}
                                >
                                  <Icon as={FiX} w={3} h={3} />
                                </Button>
                                {index === 0 && (
                                  <Badge
                                    position="absolute"
                                    bottom="2"
                                    left="2"
                                    colorScheme="orange"
                                    fontSize="xs"
                                  >
                                    Principal
                                  </Badge>
                                )}
                              </Box>
                            </GridItem>
                          ))}
                        </Grid>
                      )}

                      <Text fontSize="xs" color="gray.500">
                        Puedes arrastrar las imágenes de tu producto aquí. Selecciona y mueve una imagen para
                        cambiar el orden. Máximo 6 imágenes. Solo aceptamos formatos .jpg, .jpeg, .png y .webp.
                      </Text>
                    </>
                  )}

                  {formData.type === 'busco' && (
                    <Box textAlign="center" py={8}>
                      <Icon as={FiImage} w={12} h={12} color="gray.400" mb={4} />
                      <Text color="gray.600" fontWeight="500">
                        Las fotos son opcionales para anuncios de búsqueda
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Puedes subir una imagen de referencia si lo deseas
                      </Text>
                    </Box>
                  )}
                </VStack>

                {completedSections.has(4) && currentSection === 4 && (
                  <Flex justify="end" mt={6}>
                    <Button colorScheme="orange" onClick={goToNextSection} rightIcon={<Icon as={FiChevronRight} />}>
                      Continuar
                    </Button>
                  </Flex>
                )}
              </CardBody>
            </Card>
          )}

          {/* Section 5: Ubicación - Solo visible si Section 4 está completa */}
          {completedSections.has(4) && (
            <Card
              bg="white"
              shadow={currentSection >= 5 ? "lg" : "sm"}
              borderWidth={currentSection >= 5 ? "2px" : "1px"}
              borderColor={currentSection >= 5 ? "blue.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(5) ? "green.100" : currentSection === 5 ? "orange.100" : "gray.100"}
                    color={completedSections.has(5) ? "green.700" : currentSection === 5 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(5) ? <CheckIcon /> : "5"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    Ubicación y entrega
                  </Heading>
                  {completedSections.has(5) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {/* Región */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Comunidad Autónoma
                    </FormLabel>
                    <Select value={formData.location.region} onValueChange={(value) => updateNestedFormData('location', 'region', value)}>
                      <SelectTrigger className="h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-400">
                        <SelectValue placeholder="Selecciona tu comunidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPANISH_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  {/* Provincia */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Provincia
                    </FormLabel>
                    <Input
                      value={formData.location.province}
                      onChange={(e) => updateNestedFormData('location', 'province', e.target.value)}
                      placeholder="Ej: Madrid, Barcelona, Valencia..."
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                  </FormControl>

                  {/* Ciudad */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Ciudad
                    </FormLabel>
                    <Input
                      value={formData.location.city}
                      onChange={(e) => updateNestedFormData('location', 'city', e.target.value)}
                      placeholder="Ej: Madrid, Barcelona, Valencia..."
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                  </FormControl>

                  {/* Envío */}
                  <FormControl>
                    <Flex align="center" gap={3}>
                      <Switch
                        id="shipping"
                        checked={formData.shipping}
                        onCheckedChange={(checked) => updateFormData('shipping', checked)}
                      />
                      <Label htmlFor="shipping" className="text-sm font-medium text-gray-700">
                        Activar envío
                      </Label>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Según el tamaño del producto las opciones de envío pueden cambiar.
                    </Text>
                  </FormControl>

                  {formData.shipping && (
                    <Box p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
                      <Text fontSize="sm" color="orange.700" fontWeight="600" mb={2}>
                        ¿Qué tamaño debería elegir?
                      </Text>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="orange.600">
                          📦 <strong>Estándar:</strong> productos pequeños y medianos.
                        </Text>
                        <Text fontSize="xs" color="orange.600">
                          🚛 <strong>Grande:</strong> muebles y electrodomésticos grandes.
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </VStack>

                {completedSections.has(5) && !isServiciosCategory && (
                  <Flex justify="end" mt={6}>
                    <Text fontSize="sm" color="green.600" fontWeight="600">
                      🎉 ¡Formulario completado! Ya puedes publicar tu anuncio.
                    </Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          )}

          {/* Section 6: Especialidades y certificaciones - Solo para servicios */}
          {isServiciosCategory && completedSections.has(5) && (
            <Card
              bg="white"
              shadow={currentSection >= 6 ? "lg" : "sm"}
              borderWidth={currentSection >= 6 ? "2px" : "1px"}
              borderColor={currentSection >= 6 ? "blue.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(6) ? "green.100" : currentSection === 6 ? "orange.100" : "gray.100"}
                    color={completedSections.has(6) ? "green.700" : currentSection === 6 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(6) ? <CheckIcon /> : "6"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    Especialidades y certificaciones
                  </Heading>
                  {completedSections.has(6) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {/* Especialidades */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Especialidades
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      <HStack>
                        <Input
                          id="specialty-input"
                          placeholder="Escribe una especialidad y presiona Enter"
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                addToArray('specialties', input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          colorScheme="orange"
                          onClick={() => {
                            const input = document.getElementById('specialty-input') as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('specialties', input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </HStack>
                      
                      {/* Especialidades comunes */}
                      <Text fontSize="xs" color="gray.600">Especialidades sugeridas:</Text>
                      <Flex wrap="wrap" gap={2}>
                        {COMMON_SPECIALTIES.filter(spec => !formData.specialties.includes(spec)).slice(0, 8).map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="outline"
                            cursor="pointer"
                            _hover={{ bg: "orange.50" }}
                            onClick={() => addToArray('specialties', specialty)}
                          >
                            + {specialty}
                          </Badge>
                        ))}
                      </Flex>

                      {/* Especialidades seleccionadas */}
                      {formData.specialties.length > 0 && (
                        <VStack spacing={2} align="start">
                          <Text fontSize="sm" fontWeight="600" color="gray.700">Tus especialidades:</Text>
                          <Flex wrap="wrap" gap={2}>
                            {formData.specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                colorScheme="orange"
                                cursor="pointer"
                                onClick={() => removeFromArray('specialties', specialty)}
                              >
                                {specialty} ✕
                              </Badge>
                            ))}
                          </Flex>
                        </VStack>
                      )}
                    </VStack>
                  </FormControl>

                  {/* Certificaciones */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Certificaciones
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      <HStack>
                        <Input
                          id="certification-input"
                          placeholder="Escribe una certificación y presiona Enter"
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                addToArray('certifications', input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => {
                            const input = document.getElementById('certification-input') as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('certifications', input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </HStack>

                      {/* Certificaciones seleccionadas */}
                      {formData.certifications.length > 0 && (
                        <VStack spacing={2} align="start">
                          <Text fontSize="sm" fontWeight="600" color="gray.700">Tus certificaciones:</Text>
                          <Flex wrap="wrap" gap={2}>
                            {formData.certifications.map((cert) => (
                              <Badge
                                key={cert}
                                colorScheme="green"
                                cursor="pointer"
                                onClick={() => removeFromArray('certifications', cert)}
                              >
                                {cert} ✕
                              </Badge>
                            ))}
                          </Flex>
                        </VStack>
                      )}
                    </VStack>
                  </FormControl>

                  {/* Idiomas */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Idiomas
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="xs" color="gray.600">Selecciona los idiomas que hablas:</Text>
                      <Flex wrap="wrap" gap={2}>
                        {COMMON_LANGUAGES.filter(lang => !formData.languages.includes(lang)).map((language) => (
                          <Badge
                            key={language}
                            variant="outline"
                            cursor="pointer"
                            _hover={{ bg: "orange.50" }}
                            onClick={() => addToArray('languages', language)}
                          >
                            + {language}
                          </Badge>
                        ))}
                      </Flex>

                      {/* Idiomas seleccionados */}
                      {formData.languages.length > 0 && (
                        <VStack spacing={2} align="start">
                          <Text fontSize="sm" fontWeight="600" color="gray.700">Idiomas que hablas:</Text>
                          <Flex wrap="wrap" gap={2}>
                            {formData.languages.map((language) => (
                              <Badge
                                key={language}
                                colorScheme="purple"
                                cursor="pointer"
                                onClick={() => removeFromArray('languages', language)}
                              >
                                {language} ✕
                              </Badge>
                            ))}
                          </Flex>
                        </VStack>
                      )}
                      </VStack>
                  </FormControl>
                </VStack>

                {completedSections.has(6) && currentSection === 6 && (
                  <Flex justify="end" mt={6}>
                    <Button colorScheme="orange" onClick={goToNextSection} rightIcon={<Icon as={FiChevronRight} />}>
                      Continuar
                    </Button>
                    </Flex>
                )}
              </CardBody>
            </Card>
          )}

          {/* Section 7: Horarios y referencias - Solo para servicios */}
          {isServiciosCategory && completedSections.has(6) && (
            <Card
              bg="white"
              shadow={currentSection >= 7 ? "lg" : "sm"}
              borderWidth={currentSection >= 7 ? "2px" : "1px"}
              borderColor={currentSection >= 7 ? "blue.200" : "gray.200"}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <HStack mb={6} spacing={4}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    fontSize="sm"
                    fontWeight="600"
                    bg={completedSections.has(7) ? "green.100" : currentSection === 7 ? "orange.100" : "gray.100"}
                    color={completedSections.has(7) ? "green.700" : currentSection === 7 ? "orange.700" : "gray.500"}
                  >
                    {completedSections.has(7) ? <CheckIcon /> : "7"}
                  </Flex>
                  <Heading size="md" color="gray.800" fontWeight="600">
                    Horarios y referencias
                  </Heading>
                  {completedSections.has(7) && (
                    <Badge colorScheme="green" variant="subtle" fontWeight="500">
                      Completado
                    </Badge>
                  )}
                </HStack>

                <VStack spacing={6} align="stretch">
                  {/* Horarios disponibles */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Horarios disponibles (opcional)
                    </FormLabel>
                    <Text fontSize="xs" color="gray.600" mb={3}>
                      Especifica tus horarios de disponibilidad para cada día
                        </Text>
                    <Grid templateColumns="repeat(1, 1fr)" gap={3}>
                      {[
                        { key: 'monday', label: 'Lunes' },
                        { key: 'tuesday', label: 'Martes' },
                        { key: 'wednesday', label: 'Miércoles' },
                        { key: 'thursday', label: 'Jueves' },
                        { key: 'friday', label: 'Viernes' },
                        { key: 'saturday', label: 'Sábado' },
                        { key: 'sunday', label: 'Domingo' }
                      ].map((day) => (
                        <HStack key={day.key} spacing={3}>
                          <Text fontSize="sm" minW="80px" color="gray.700">{day.label}:</Text>
                          <Input
                            size="sm"
                            placeholder="Ej: 9:00 - 17:00"
                            value={formData.schedule[day.key as keyof typeof formData.schedule]}
                            onChange={(e) => updateNestedFormData('schedule', day.key, e.target.value)}
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                          />
                        </HStack>
                      ))}
                    </Grid>
                  </FormControl>

                  {/* Portfolio */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Portfolio o trabajos destacados
                    </FormLabel>
                    <Textarea
                      value={formData.portfolio}
                      onChange={(e) => updateFormData('portfolio', e.target.value)}
                      placeholder="Describe tus trabajos más destacados, enlaces a portfolio online, o ejemplos específicos de tu experiencia..."
                      rows={3}
                      resize="none"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Opcional: Ayuda a mostrar la calidad de tu trabajo
                          </Text>
                  </FormControl>

                  {/* Referencias */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Referencias y comentarios adicionales
                    </FormLabel>
                    <Textarea
                      value={formData.references}
                      onChange={(e) => updateFormData('references', e.target.value)}
                      placeholder="Describe tu experiencia laboral, referencias de empleadores anteriores, logros destacados, o cualquier información adicional que consideres relevante..."
                      rows={4}
                      resize="none"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px #f56500" }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Esta información ayudará a los empleadores a conocerte mejor
                          </Text>
                  </FormControl>
                </VStack>

                {completedSections.has(7) && (
                  <Flex justify="end" mt={6}>
                    <Text fontSize="sm" color="green.600" fontWeight="600">
                      🎉 ¡Formulario completado! Ya puedes publicar tu servicio.
                    </Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          )}

        </VStack>

        {/* Footer Sticky */}
        <Box
          position="fixed"
          bottom="0"
          left="240px"
          right="0"
          bg="white"
          borderTopWidth="1px"
          borderColor="gray.200"
          p={4}
          shadow="lg"
          zIndex="5"
        >
          <Container maxW="container.lg">
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color="gray.600" fontWeight="500">
                {completedSections.size > 0 && (
                  <>Has completado {completedSections.size} de {totalSections} secciones</>
                )}
                {/* Debug info */}
                <br />
                <Text fontSize="xs" color="red.500">
                  Debug: {completedSections.size}/{totalSections} - {Array.from(completedSections).join(', ')}
                </Text>
              </Text>
              <HStack spacing={3}>
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  colorScheme="gray"
                  size="md"
                >
                  Cancelar
                </Button>
                {/* Debug: Always show button */}
                <Button 
                  colorScheme="orange" 
                  onClick={handlePublish} 
                  fontWeight="600"
                  size="md"
                  bg="orange.500"
                  _hover={{ bg: "orange.600" }}
                  isDisabled={completedSections.size !== totalSections}
                >
                  Publicar anuncio {completedSections.size !== totalSections && '(Incompleto)'}
                </Button>
              </HStack>
            </Flex>
          </Container>
        </Box>

        {/* Spacer for fixed footer */}
        <Box h="80px" />
      </Container>
    </Box>
  );
}
