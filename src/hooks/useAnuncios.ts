import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Anuncio {
  id: string;
  user_id: string;
  tipo: 'vendo' | 'compro' | 'alquilo' | 'busco_alquiler' | 'oferta' | 'busco_servicio';
  categoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  estado_producto: string;
  precio?: number;
  precio_alquiler_dia?: number;
  precio_alquiler_semana?: number;
  precio_alquiler_mes?: number;
  moneda: string;
  // Provider information
  actor_type: 'user' | 'provider';
  provider_id?: string;
  provider_info?: {
    name: string;
    cif?: string;
    verified: boolean;
    rating?: number;
    total_sales?: number;
  };
  dimensiones?: {
    width?: string;
    height?: string;
    depth?: string;
  };
  ubicacion: {
    region: string;
    province: string;
    city: string;
  };
  imagenes: string[];
  envio: boolean;
  estado: 'activo' | 'pausado' | 'expirado' | 'finalizado';
  visualizaciones: number;
  favoritos: number;
  contactos: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  // Campos específicos para servicios
  experiencia_anos?: number;
  disponibilidad?: string;
  salario_min?: number;
  salario_max?: number;
  tipo_salario?: 'hora' | 'dia' | 'mes' | 'año' | 'proyecto';
  especialidades?: string[];
  certificaciones?: string[];
  idiomas?: string[];
  disponibilidad_horario?: {
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    sabado?: string;
    domingo?: string;
  };
  referencias?: string;
  portfolio?: string;
}

export interface CreateAnuncioData {
  tipo: 'vendo' | 'compro' | 'alquilo' | 'busco_alquiler' | 'oferta' | 'busco_servicio';
  categoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  estado_producto: string;
  precio?: number;
  precio_alquiler_dia?: number;
  precio_alquiler_semana?: number;
  precio_alquiler_mes?: number;
  moneda: string;
  // Provider information
  actor_type?: 'user' | 'provider';
  provider_id?: string;
  dimensiones?: {
    width?: string;
    height?: string;
    depth?: string;
  };
  ubicacion: {
    region: string;
    province: string;
    city: string;
  };
  imagenes?: string[];
  envio: boolean;
  // Campos opcionales para servicios
  experiencia_anos?: number;
  disponibilidad?: string;
  salario_min?: number;
  salario_max?: number;
  tipo_salario?: 'hora' | 'dia' | 'mes' | 'año' | 'proyecto';
  especialidades?: string[];
  certificaciones?: string[];
  idiomas?: string[];
  disponibilidad_horario?: {
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    sabado?: string;
    domingo?: string;
  };
  referencias?: string;
  portfolio?: string;
}

export function useAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [misAnuncios, setMisAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [misAnunciosLoading, setMisAnunciosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

  // Fetch all active anuncios
  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnuncios(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching anuncios');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's anuncios
  const fetchMisAnuncios = async () => {
    if (!user) {
      setMisAnuncios([]);
      return;
    }

    try {
      setMisAnunciosLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMisAnuncios(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching mis anuncios');
      setMisAnuncios([]);
    } finally {
      setMisAnunciosLoading(false);
    }
  };

  // Create new anuncio
  const createAnuncio = async (anuncioData: CreateAnuncioData): Promise<Anuncio | null> => {
    if (!user) {
      setError('User must be logged in to create anuncio');
      return null;
    }

    try {
      console.log('🚀 useAnuncios: Inserting data:', JSON.stringify({
        ...anuncioData,
        user_id: user.id
      }, null, 2));

      const { data, error } = await supabase
        .from('anuncios')
        .insert([{
          ...anuncioData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Success! Created anuncio:', data);

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return data;
    } catch (err) {
      console.error('💥 createAnuncio error:', err);
      console.error('💥 Error code:', err?.code);
      console.error('💥 Error message:', err?.message);
      console.error('💥 Error details:', err?.details);
      console.error('💥 Error hint:', err?.hint);
      setError(err instanceof Error ? err.message : 'Error creating anuncio');
      return null;
    }
  };

  // Update anuncio
  const updateAnuncio = async (id: string, updates: Partial<CreateAnuncioData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('anuncios')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating anuncio');
      return false;
    }
  };

  // Delete anuncio
  const deleteAnuncio = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting anuncio');
      return false;
    }
  };

  // Change anuncio status
  const changeAnuncioStatus = async (id: string, estado: 'activo' | 'pausado' | 'finalizado'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ estado })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing anuncio status');
      return false;
    }
  };

  // Increment views
  const incrementViews = async (id: string): Promise<void> => {
    try {
      await supabase.rpc('increment_anuncio_views', { anuncio_id: id });
    } catch (err) {
      // Silently fail for view increments
      console.warn('Failed to increment views:', err);
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchAnuncios();
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (user && initialized) {
      fetchMisAnuncios();
    } else if (!user) {
      setMisAnuncios([]);
    }
  }, [user, initialized]);

  return {
    anuncios,
    misAnuncios,
    loading: misAnunciosLoading, // Para MisAnuncios page usa misAnunciosLoading
    allAnunciosLoading: loading, // Para otras páginas
    error,
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
    changeAnuncioStatus,
    incrementViews,
    refreshAnuncios: fetchAnuncios,
    refreshMisAnuncios: fetchMisAnuncios
  };
}
