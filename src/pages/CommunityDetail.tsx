import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCommunitiesBasic } from "@/hooks/useCommunitiesBasic";
import { usePostsSimple } from "@/hooks/usePostsSimple";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Calendar,
  Globe,
  Shield,
  MessageCircle,
  Heart,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CommunityMeta {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  member_count?: number | null;
  is_public: boolean;
  created_at?: string | null;
}

export default function CommunityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Use basic hook for community data (super simple)
  const { myCommunities, loading: loadingCommunity } = useCommunitiesBasic();
  const allCommunities = []; // Not needed for community detail
  
  // Find community by slug
  const community = useMemo(() => {
    return [...allCommunities, ...myCommunities].find(c => c.slug === slug);
  }, [allCommunities, myCommunities, slug]);
  
  // Check if user is member
  const isUserMember = useMemo(() => {
    return myCommunities.some(c => c.id === community?.id);
  }, [myCommunities, community?.id]);
  
  // TODO: Add userRole and isUserAdmin logic if needed
  const userRole = "member";
  const isUserAdmin = false;

  // ✅ LOCAL STATE: Community modifications (for banner updates)
  const [communityLocal, setCommunityLocal] = useState<typeof community>(null);
  const displayCommunity = communityLocal || community;

  // ✅ REMOVED: loadingCommunityBackup - use loadingCommunity from useCommunity hook
  const [rules, setRules] = useState<Array<{ id: string | number; title: string; description?: string }>>([]);
  const [isEditingRules, setIsEditingRules] = useState<boolean>(false);
  const [savingRuleIds, setSavingRuleIds] = useState<Set<string | number>>(new Set());
  const [role, setRole] = useState<"member" | "moderator" | "admin" | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);
  const [dragRuleId, setDragRuleId] = useState<string | number | null>(null);
  const [rulesDirty, setRulesDirty] = useState<boolean>(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ OPTIMIZED: Removed duplicate community loading - useCommunity hook handles this efficiently

  // Fetch community rules (optional table: community_rules)
  useEffect(() => {
    let isMounted = true;
    const loadRules = async () => {
      if (!community?.id) return;
      const { data, error } = await supabase
        .from("community_rules")
        .select("id, title, description")
        .eq("community_id", community.id)
        .order("position", { ascending: true });
      if (!isMounted) return;
      if (!error && Array.isArray(data)) {
        setRules(data as any);
      } else {
        setRules([]);
      }
    };
    loadRules();
    return () => { isMounted = false };
  }, [community?.id]);

  // Fetch current user role in this community (admin/mod can manage rules)
  useEffect(() => {
    let isMounted = true;
    const loadRole = async () => {
      if (!user?.id || !community?.id) return;
      const { data } = await supabase
        .from('community_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('community_id', community.id)
        .maybeSingle();
      if (!isMounted) return;
      // roles could be 'admin' | 'moderator' | 'member'
      setRole((data?.role as any) || 'member');
    };
    loadRole();
    return () => { isMounted = false };
  }, [user?.id, community?.id]);

  // Rule CRUD helpers
  const addRule = async () => {
    if (!community?.id) return;
    const newRule = { id: `temp-${Date.now()}`, title: "Nueva regla", description: "" };
    setRules(prev => [...prev, newRule]);
    // Persist
    const { data, error } = await supabase
      .from('community_rules')
      .insert({ community_id: community.id, title: newRule.title, description: newRule.description, position: rules.length })
      .select('id, title, description')
      .single();
    if (!error && data) {
      setRules(prev => prev.map(r => r.id === newRule.id ? data : r));
    }
  };

  const updateRule = async (id: string | number, updates: { title?: string; description?: string }) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    if (typeof id === 'string' && id.toString().startsWith('temp-')) return; // not persisted yet
    setSavingRuleIds(prev => new Set(prev).add(id));
    const { error } = await supabase
      .from('community_rules')
      .update({ title: updates.title, description: updates.description })
      .eq('id', id);
    setSavingRuleIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    if (error) console.error('updateRule error', error);
  };

  const deleteRule = async (id: string | number) => {
    setRules(prev => prev.filter(r => r.id !== id));
    if (typeof id === 'string' && id.toString().startsWith('temp-')) return;
    await supabase.from('community_rules').delete().eq('id', id);
  };

  // Banner upload helpers
  const onSelectBanner = async (file?: File | null) => {
    if (!file || !community?.id) return;
    try {
      setIsUploadingBanner(true);
      // Auto-crop to 21:9 using canvas
      const imgDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imgDataUrl;
      });
      const targetRatio = 21 / 9;
      const srcRatio = image.width / image.height;
      let sx = 0, sy = 0, sw = image.width, sh = image.height;
      if (srcRatio > targetRatio) {
        // Source is wider → crop width
        const desiredWidth = image.height * targetRatio;
        sx = (image.width - desiredWidth) / 2;
        sw = desiredWidth;
      } else {
        // Source is taller → crop height
        const desiredHeight = image.width / targetRatio;
        sy = (image.height - desiredHeight) / 2;
        sh = desiredHeight;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1680; // export in good width
      canvas.height = Math.round(1680 / targetRatio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.9));

      const ext = 'jpg';
      const path = `${community.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('banners').upload(path, blob, { upsert: true, cacheControl: '3600', contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      const { error: updErr } = await supabase.from('communities').update({ banner_url: publicUrl }).eq('id', community.id);
      if (updErr) throw updErr;
      setCommunityLocal(prev => (prev || community) ? { ...(prev || community)!, banner_url: publicUrl } : null);
      toast.success('Banner actualizado');
    } catch (e: any) {
      console.error('Upload banner error', e);
      toast.error('No se pudo subir el banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const removeBanner = async () => {
    if (!community?.id) return;
    try {
      const { error } = await supabase.from('communities').update({ banner_url: null }).eq('id', community.id);
      if (error) throw error;
      setCommunityLocal(prev => (prev || community) ? { ...(prev || community)!, banner_url: null } : null);
      toast.success('Banner eliminado');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar el banner');
    }
  };

  const communityId = displayCommunity?.id;
  const { posts, loading, hasMore, loadMore, toggleLike } = usePostsSimple({ communityId });

  const titleInitials = useMemo(() => {
    return displayCommunity?.name
      ? displayCommunity.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
      : "";
  }, [displayCommunity?.name]);

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      {/* Cover / Banner */}
      <div className="w-full h-28 md:h-36 border-b relative">
        {displayCommunity?.banner_url ? (
          <img src={displayCommunity.banner_url} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-50 via-repsol-blue/10 to-orange-50" />
        )}
        {(['admin','moderator'] as const).includes((role as any)) && (
          <div className="absolute right-4 bottom-3 flex items-center gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onSelectBanner(e.target.files?.[0] || null)}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isUploadingBanner}
              onClick={() => bannerInputRef.current?.click()}
            >
              {isUploadingBanner ? 'Subiendo…' : 'Cambiar banner'}
            </Button>
            {displayCommunity?.banner_url && (
              <Button variant="ghost" size="sm" className="text-red-600" onClick={removeBanner}>Quitar</Button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 rounded-lg bg-repsol-blue">
            <AvatarImage src={displayCommunity?.avatar_url || undefined} />
            <AvatarFallback className="rounded-lg text-base font-semibold text-white bg-repsol-blue">
              {titleInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold truncate text-repsol-blue">
                {loadingCommunity ? "Cargando comunidad..." : displayCommunity?.name}
              </h1>
              {!displayCommunity?.is_public && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600 border-orange-200">
                  <Shield className="h-3 w-3 mr-1" /> Privada
                </Badge>
              )}
            </div>
            {displayCommunity?.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {displayCommunity.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-orange-500" />
                <span className="text-orange-600 font-medium">{displayCommunity?.member_count?.toLocaleString() || 0}</span> miembros
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-orange-500" />
                {displayCommunity?.is_public ? "Pública" : "Privada"}
              </span>
              {displayCommunity?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  creada {new Date(displayCommunity.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="gap-2 hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Column */}
          <div className="lg:col-span-2 space-y-3">
            {loading && posts.length === 0 && (
              <Card><CardContent className="h-40 animate-pulse" /></Card>
            )}
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/platform/post/${post.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 bg-repsol-blue">
                      <AvatarImage src={post.profiles?.avatar_url || post.organizations?.logo_url || undefined} />
                      <AvatarFallback className="bg-repsol-blue text-white text-sm font-medium">
                        {(post.profiles?.full_name || post.organizations?.name || "U").slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-repsol-blue group-hover:text-orange-600 transition-colors">
                          {post.profiles?.full_name || post.organizations?.name || "Usuario"}
                        </span>
                        <span>•</span>
                        <span>hace {(() => {
                          const hours = Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
                          if (hours >= 24) {
                            const days = Math.floor(hours / 24);
                            return `${days} ${days === 1 ? 'día' : 'días'}`;
                          }
                          return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
                        })()}</span>
                      </div>
                      <div className="mt-1 text-[15px] leading-6 whitespace-pre-wrap break-words text-gray-900">
                        {post.content}
                      </div>
                      {post.post_media && post.post_media.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {post.post_media.map((m) => (
                            <img key={m.url} src={m.url} alt="media" className="rounded-md border shadow-sm" />
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            toggleLike(post.id);
                          }}
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full px-2 py-1 transition-colors"
                        >
                          <Heart className="h-4 w-4" /> {post.likes_count || 0}
                        </button>
                        <div className="inline-flex items-center gap-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full px-2 py-1 transition-colors">
                          <MessageCircle className="h-4 w-4" /> {post.comments_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button 
                  variant="outline" 
                  onClick={() => loadMore()} 
                  className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-sm"
                >
                  Cargar más
                  <ArrowDownCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/20">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-base font-semibold">Sobre la comunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 p-4">
                  <p className="leading-relaxed text-gray-700">
                    {displayCommunity?.description || "Sin descripción todavía."}
                  </p>
                  <Separator className="bg-orange-100" />
                  <div className="flex items-center justify-between">
                    <span>Miembros</span>
                    <span className="font-medium text-orange-600">{displayCommunity?.member_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Privacidad</span>
                    <span className="font-medium text-repsol-blue">{displayCommunity?.is_public ? "Pública" : "Privada"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Community Rules */}
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/20">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-base font-semibold">Reglas de la comunidad</CardTitle>
                  {(['admin','moderator'] as const).includes((role as any)) && (
                    <Button 
                      variant={isEditingRules ? 'secondary' : 'outline'} 
                      size="sm" 
                      onClick={() => setIsEditingRules(v => !v)}
                      className={isEditingRules ? 'bg-white text-orange-600' : 'border-white text-white hover:bg-white hover:text-orange-600'}
                    >
                      {isEditingRules ? 'Cerrar' : 'Gestionar'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {isEditingRules ? (
                    <div className="space-y-4">
                      {rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="space-y-2 p-3 rounded-md border border-orange-200 bg-orange-50/30 hover:bg-orange-50/50 transition-colors"
                          draggable
                          onDragStart={() => setDragRuleId(rule.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragRuleId === null || dragRuleId === rule.id) return;
                            setRules(prev => {
                              const from = prev.findIndex(r => r.id === dragRuleId);
                              const to = prev.findIndex(r => r.id === rule.id);
                              if (from === -1 || to === -1) return prev;
                              const copy = [...prev];
                              const [moved] = copy.splice(from, 1);
                              copy.splice(to, 0, moved);
                              return copy;
                            });
                            setRulesDirty(true);
                          }}
                        >
                          <Input
                            value={rule.title}
                            onChange={(e) => updateRule(rule.id, { title: e.target.value })}
                            placeholder="Título de la regla"
                          />
                          <Textarea
                            value={rule.description || ''}
                            onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                            placeholder="Descripción"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{savingRuleIds.has(rule.id) ? 'Guardando…' : ' '}</span>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteRule(rule.id)}>Eliminar</Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={addRule} className="border-orange-200 text-orange-600 hover:bg-orange-50">Añadir regla</Button>
                        <Button
                          variant="default"
                          disabled={!rulesDirty}
                          onClick={async () => {
                            if (!displayCommunity?.id) return;
                            // Persist positions
                            await Promise.all(
                              rules.map((r, index) => supabase
                                .from('community_rules')
                                .update({ position: index })
                                .eq('id', r.id)
                              )
                            );
                            setRulesDirty(false);
                            toast.success('Orden guardado');
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Guardar orden
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.length === 0 && (
                        <p className="text-sm text-gray-500">Aún no hay reglas definidas.</p>
                      )}
                      {rules.map((rule, index) => (
                        <div key={rule.id} className="text-sm p-3 bg-orange-50/30 rounded-lg border border-orange-100 hover:bg-orange-50/50 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium text-repsol-blue">{rule.title}</div>
                              {rule.description && (
                                <div className="text-gray-600 mt-1">{rule.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


