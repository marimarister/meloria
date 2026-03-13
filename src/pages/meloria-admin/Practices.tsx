import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Practice {
  id: string;
  title: string;
  description: string | null;
  provider: string | null;
  price_credits: number;
  duration_minutes: number | null;
  format: string | null;
  social_fit_solo: number;
  social_fit_group: number;
  intensity: string | null;
  targets_ee: number;
  targets_dp: number;
  targets_pa: number;
  fit_v: number;
  fit_a: number;
  fit_k: number;
  fit_d: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  title_lv: string | null;
  description_lv: string | null;
}

const emptyForm: Omit<Practice, 'id'> = {
  title: '',
  description: '',
  provider: '',
  price_credits: 0,
  duration_minutes: 60,
  format: 'offline',
  social_fit_solo: 0.5,
  social_fit_group: 0.5,
  intensity: 'medium',
  targets_ee: 0.5,
  targets_dp: 0.5,
  targets_pa: 0.5,
  fit_v: 0.5,
  fit_a: 0.5,
  fit_k: 0.5,
  fit_d: 0.5,
  is_active: true,
  is_featured: false,
  image_url: null,
  title_lv: null,
  description_lv: null,
};

const Practices = () => {
  const { t } = useLanguage();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Practice, 'id'>>(emptyForm);

  useEffect(() => { loadPractices(); }, []);

  const loadPractices = async () => {
    const { data, error } = await supabase.from("practices" as any).select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setPractices(data as any[] || []);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Practice) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      provider: p.provider,
      price_credits: p.price_credits,
      duration_minutes: p.duration_minutes,
      format: p.format,
      social_fit_solo: Number(p.social_fit_solo),
      social_fit_group: Number(p.social_fit_group),
      intensity: p.intensity,
      targets_ee: Number(p.targets_ee),
      targets_dp: Number(p.targets_dp),
      targets_pa: Number(p.targets_pa),
      fit_v: Number(p.fit_v),
      fit_a: Number(p.fit_a),
      fit_k: Number(p.fit_k),
      fit_d: Number(p.fit_d),
      is_active: p.is_active,
      is_featured: p.is_featured,
      image_url: p.image_url,
      title_lv: p.title_lv || null,
      description_lv: p.description_lv || null,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }

    if (editingId) {
      const { error } = await supabase.from("practices" as any).update(form as any).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Practice updated");
    } else {
      const { error } = await supabase.from("practices" as any).insert(form as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Practice created");
    }

    setDialogOpen(false);
    loadPractices();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("practices" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Practice deleted");
    loadPractices();
  };

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('meloria.practicesTitle')}</h1>
          <p className="text-muted-foreground">{t('meloria.practicesDescription')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> {t('meloria.addPractice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t('meloria.editPractice') : t('meloria.addPractice')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {/* Basic info */}
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Title (LV)</Label>
                <Input value={form.title_lv || ''} onChange={e => updateField('title_lv', e.target.value || null)} placeholder="Latvian title" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={form.description || ''} onChange={e => updateField('description', e.target.value)} rows={3} />
              </div>
              <div className="grid gap-2">
                <Label>Description (LV)</Label>
                <Textarea value={form.description_lv || ''} onChange={e => updateField('description_lv', e.target.value || null)} rows={3} placeholder="Latvian description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Provider</Label>
                  <Input value={form.provider || ''} onChange={e => updateField('provider', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Price (credits)</Label>
                  <Input type="number" value={form.price_credits} onChange={e => updateField('price_credits', +e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration_minutes || ''} onChange={e => updateField('duration_minutes', +e.target.value || null)} />
                </div>
                <div className="grid gap-2">
                  <Label>Format</Label>
                  <Select value={form.format || ''} onValueChange={v => updateField('format', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Intensity</Label>
                  <Select value={form.intensity || ''} onValueChange={v => updateField('intensity', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="intensive">Intensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scoring weights */}
              <h4 className="font-semibold mt-2">Burnout Targets (0.0–1.0)</h4>
              <div className="grid grid-cols-3 gap-4">
                {(['targets_ee', 'targets_dp', 'targets_pa'] as const).map(key => (
                  <div key={key} className="grid gap-2">
                    <Label className="text-xs uppercase">{key.replace('targets_', '')}</Label>
                    <Input type="number" step="0.1" min="0" max="1" value={form[key]} onChange={e => updateField(key, +e.target.value)} />
                  </div>
                ))}
              </div>

              <h4 className="font-semibold">VAKD Fit (0.0–1.0)</h4>
              <div className="grid grid-cols-4 gap-4">
                {(['fit_v', 'fit_a', 'fit_k', 'fit_d'] as const).map(key => (
                  <div key={key} className="grid gap-2">
                    <Label className="text-xs uppercase">{key.replace('fit_', '')}</Label>
                    <Input type="number" step="0.1" min="0" max="1" value={form[key]} onChange={e => updateField(key, +e.target.value)} />
                  </div>
                ))}
              </div>

              <h4 className="font-semibold">Social Fit (0.0–1.0)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs">Solo</Label>
                  <Input type="number" step="0.1" min="0" max="1" value={form.social_fit_solo} onChange={e => updateField('social_fit_solo', +e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Group</Label>
                  <Input type="number" step="0.1" min="0" max="1" value={form.social_fit_group} onChange={e => updateField('social_fit_group', +e.target.value)} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => updateField('is_active', v)} />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={v => updateField('is_featured', v)} />
                  <Label>Featured</Label>
                </div>
              </div>

              <Button onClick={handleSave} className="mt-2">{editingId ? t('common.save') : t('meloria.addPractice')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : practices.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t('meloria.noPractices')}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {practices.map(p => (
            <Card key={p.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {!p.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  {p.is_featured && <Badge className="text-xs">Featured</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {p.provider || 'No provider'} · {p.format} · {p.duration_minutes}min · {p.intensity} · {p.price_credits} credits
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{p.title}". This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.id)}>{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Practices;
