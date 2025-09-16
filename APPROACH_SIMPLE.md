# APPROACH SIMPLE Y ESTÁNDAR

## ❌ LO QUE HICE (OVERKILL):
```
src/services/api.ts (300+ líneas)
src/hooks/optimized/useOptimizedProfile.ts (200+ líneas)  
src/hooks/optimized/useOptimizedCommunities.ts (150+ líneas)
src/hooks/optimized/useOptimizedAnuncios.ts (100+ líneas)
queryKeys gigantes + cache management manual
```

## ✅ LO QUE DEBERÍAS HACER (SIMPLE):
```
src/hooks/useProfile.ts (50 líneas máximo)
src/hooks/useCommunities.ts (30 líneas)
src/hooks/useAnuncios.ts (40 líneas)
React Query directo, sin abstracciones
```

## EJEMPLO REAL:

### ANTES (tu hook original tenía problemas):
```typescript
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProfile();      // Query 1
    fetchWorkExp();      // Query 2 
    fetchEducation();    // Query 3
  }, []);
  
  // ❌ 3 queries separadas, sin cache, loading infinito
}
```

### SOLUCIÓN SIMPLE CON REACT QUERY:
```typescript
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      // ✅ Una sola función, Promise.all para paralelizar
      const [profile, workExp, education] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('work_experiences').select('*').eq('user_id', userId),
        supabase.from('education').select('*').eq('user_id', userId)
      ]);
      
      return {
        profile: profile.data,
        workExperiences: workExp.data || [],
        education: education.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
```

## ¿POR QUÉ ESTO ES MEJOR?

1. **10x menos código**
2. **React Query estándar** - cualquier dev lo entiende
3. **Cero abstracciones custom** 
4. **Fácil debug** - todo en un lugar
5. **Mantenible** - cambias 1 archivo, no 4

## PARA MUTATIONS:
```typescript
export function useCreateWorkExperience() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => supabase.from('work_experiences').insert([data]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

## RESULTADO:
- ✅ 95% menos código
- ✅ Estándar de la industria  
- ✅ Fácil de entender
- ✅ Fácil de mantener
- ✅ Mismo rendimiento
