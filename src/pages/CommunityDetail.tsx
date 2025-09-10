import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCommunities } from "@/hooks/useCommunities";
import { usePosts } from "@/hooks/usePosts";
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

  const [community, setCommunity] = useState<CommunityMeta | null>(null);
  const [loadingCommunity, setLoadingCommunity] = useState<boolean>(true);
  const [rules, setRules] = useState<Array<{ id: string | number; title: string; description?: string }>>([]);
  const [isEditingRules, setIsEditingRules] = useState<boolean>(false);
  const [savingRuleIds, setSavingRuleIds] = useState<Set<string | number>>(new Set());
  const [role, setRole] = useState<"member" | "moderator" | "admin" | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);
  const [dragRuleId, setDragRuleId] = useState<string | number | null>(null);
  const [rulesDirty, setRulesDirty] = useState<boolean>(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch community by slug
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoadingCommunity(true);
      const { data, error } = await supabase
        .from("communities")
        .select("id, name, slug, description, avatar_url, banner_url, member_count, is_public, created_at")
        .eq("slug", slug)
        .single();
      if (!isMounted) return;
      if (error) {
        console.error("CommunityDetail: error loading community", error);
        setCommunity(null);
      } else {
        setCommunity(data as CommunityMeta);
      }
      setLoadingCommunity(false);
    };
    if (slug) load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

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
      setCommunity(prev => prev ? { ...prev, banner_url: publicUrl } : prev);
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
      setCommunity(prev => prev ? { ...prev, banner_url: null } : prev);
      toast.success('Banner eliminado');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar el banner');
    }
  };

  const communityId = community?.id;
  const { posts, loading, hasMore, loadMore, toggleLike } = usePosts({ communityId });

  const titleInitials = useMemo(() => {
    return community?.name
      ? community.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
      : "";
  }, [community?.name]);

  return (
    <main className="flex-1 min-h-screen bg-background">
      {/* Cover / Banner */}
      <div className="w-full h-28 md:h-36 border-b relative">
        {community?.banner_url ? (
          <img src={community.banner_url} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50" />
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
            {community?.banner_url && (
              <Button variant="ghost" size="sm" className="text-red-600" onClick={removeBanner}>Quitar</Button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={community?.avatar_url || undefined} />
            <AvatarFallback className="rounded-lg text-base font-semibold">
              {titleInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold truncate">
                {loadingCommunity ? "Cargando comunidad..." : community?.name}
              </h1>
              {!community?.is_public && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" /> Privada
                </Badge>
              )}
            </div>
            {community?.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {community.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {community?.member_count?.toLocaleString() || 0} miembros
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {community?.is_public ? "Pública" : "Privada"}
              </span>
              {community?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  creada {new Date(community.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
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
              <Card key={post.id} className="border border-gray-200 hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={post.profiles?.avatar_url || post.organizations?.logo_url || undefined} />
                      <AvatarFallback>
                        {(post.profiles?.full_name || post.organizations?.name || "").slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {post.profiles?.full_name || post.organizations?.name || "Usuario"}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 text-[15px] leading-6 whitespace-pre-wrap break-words">
                        {post.content}
                      </div>
                      {post.post_media && post.post_media.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {post.post_media.map((m) => (
                            <img key={m.url} src={m.url} alt="media" className="rounded-md border" />
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-foreground"
                        >
                          <Heart className="h-4 w-4" /> {post.likes_count}
                        </button>
                        <div className="inline-flex items-center gap-1 text-gray-600">
                          <MessageCircle className="h-4 w-4" /> {post.comments_count}
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
                <Button variant="outline" onClick={() => loadMore()} className="gap-2">
                  Cargar más
                  <ArrowDownCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Sobre la comunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    {community?.description || "Sin descripción todavía."}
                  </p>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span>Miembros</span>
                    <span className="font-medium text-foreground">{community?.member_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Privacidad</span>
                    <span className="font-medium text-foreground">{community?.is_public ? "Pública" : "Privada"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Community Rules */}
              <Card className="border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Reglas de la comunidad</CardTitle>
                  {(['admin','moderator'] as const).includes((role as any)) && (
                    <Button variant={isEditingRules ? 'secondary' : 'outline'} size="sm" onClick={() => setIsEditingRules(v => !v)}>
                      {isEditingRules ? 'Cerrar' : 'Gestionar'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditingRules ? (
                    <div className="space-y-4">
                      {rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="space-y-2 p-3 rounded-md border"
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
                            <span className="text-xs text-muted-foreground">{savingRuleIds.has(rule.id) ? 'Guardando…' : ' '}</span>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteRule(rule.id)}>Eliminar</Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={addRule}>Añadir regla</Button>
                        <Button
                          variant="default"
                          disabled={!rulesDirty}
                          onClick={async () => {
                            if (!community?.id) return;
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
                        >
                          Guardar orden
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aún no hay reglas definidas.</p>
                      )}
                      {rules.map((rule) => (
                        <div key={rule.id} className="text-sm">
                          <div className="font-medium text-foreground">{rule.title}</div>
                          {rule.description && (
                            <div className="text-muted-foreground">{rule.description}</div>
                          )}
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


