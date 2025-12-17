import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, Loader2, Upload, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolInfo {
  id: string;
  school_id: string;
  name: string;
  acronym: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  theme_id: string;
}

const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Classic Blue',
    colors: {
      primary: '221 83% 53%',
      secondary: '210 40% 96%',
      accent: '210 40% 90%',
      card: '0 0% 100%',
      muted: '210 40% 96%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    colors: {
      primary: '160 84% 39%',
      secondary: '152 76% 95%',
      accent: '152 76% 90%',
      card: '0 0% 100%',
      muted: '152 76% 95%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    colors: {
      primary: '263 70% 50%',
      secondary: '260 60% 96%',
      accent: '260 60% 90%',
      card: '0 0% 100%',
      muted: '260 60% 96%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    colors: {
      primary: '38 92% 50%',
      secondary: '48 96% 95%',
      accent: '48 96% 90%',
      card: '0 0% 100%',
      muted: '48 96% 95%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'rose',
    name: 'Soft Rose',
    colors: {
      primary: '350 89% 60%',
      secondary: '350 80% 96%',
      accent: '350 80% 90%',
      card: '0 0% 100%',
      muted: '350 80% 96%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    colors: {
      primary: '189 94% 43%',
      secondary: '185 90% 95%',
      accent: '185 90% 90%',
      card: '0 0% 100%',
      muted: '185 90% 95%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    colors: {
      primary: '215 28% 17%',
      secondary: '210 40% 96%',
      accent: '210 40% 90%',
      card: '0 0% 100%',
      muted: '210 40% 96%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'teal',
    name: 'Fresh Teal',
    colors: {
      primary: '172 66% 50%',
      secondary: '166 76% 95%',
      accent: '166 76% 90%',
      card: '0 0% 100%',
      muted: '166 76% 95%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    colors: {
      primary: '25 95% 53%',
      secondary: '30 90% 96%',
      accent: '30 90% 90%',
      card: '0 0% 100%',
      muted: '30 90% 96%',
      background: '0 0% 100%',
    },
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    colors: {
      primary: '239 84% 67%',
      secondary: '226 70% 96%',
      accent: '226 70% 90%',
      card: '0 0% 100%',
      muted: '226 70% 96%',
      background: '0 0% 100%',
    },
  },
];

export const SchoolSettings = () => {
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('MABDC');
  const [formData, setFormData] = useState<Partial<SchoolInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    const school = schools.find(s => s.school_id === selectedSchool);
    if (school) {
      setFormData(school);
      setSelectedTheme(school.theme_id || 'default');
    }
  }, [selectedSchool, schools]);

  const fetchSchools = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .order('name');

    if (!error && data) {
      setSchools(data as SchoolInfo[]);
      if (data.length > 0) {
        setFormData(data[0] as SchoolInfo);
        setSelectedTheme(data[0].theme_id || 'default');
      }
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('school_settings')
      .update({
        name: formData.name,
        acronym: formData.acronym,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo_url: formData.logo_url,
        theme_id: selectedTheme,
      })
      .eq('id', formData.id);

    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('School settings saved successfully');
      applyTheme(selectedTheme);
      fetchSchools();
    }
    setIsSaving(false);
  };

  const applyTheme = (themeId: string) => {
    const theme = THEME_OPTIONS.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Save to localStorage for persistence
    localStorage.setItem('app-theme', themeId);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `school-logo-${selectedSchool}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('student-photos')
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error('Failed to upload logo');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName);

    setFormData({ ...formData, logo_url: urlData.publicUrl });
    toast.success('Logo uploaded');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Theme
          </CardTitle>
          <CardDescription>Choose a color theme for the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {THEME_OPTIONS.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedTheme(theme.id);
                  applyTheme(theme.id);
                }}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  selectedTheme === theme.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                  />
                </div>
                <p className="text-xs font-medium text-center truncate">{theme.name}</p>
                {selectedTheme === theme.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>Manage school details and branding</CardDescription>
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.school_id} value={school.school_id}>
                    {school.acronym || school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
              {formData.logo_url ? (
                <img
                  src={formData.logo_url}
                  alt="School logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">School Logo</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload a logo image (PNG, JPG)
              </p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full school name"
              />
            </div>
            <div className="space-y-2">
              <Label>Acronym</Label>
              <Input
                value={formData.acronym || ''}
                onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                placeholder="e.g., MABDC"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 XX XXX XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.school.edu"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full school address"
                rows={2}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
