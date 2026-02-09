import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool, SCHOOL_THEMES, SchoolType } from '@/contexts/SchoolContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GraduationCap, Lock, User, RefreshCcw } from 'lucide-react';
import { z } from 'zod';
import { useSchoolSettings } from '@/hooks/useSchoolSettings';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or LRN is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, loading } = useAuth();
  const { selectedSchool, setSelectedSchool } = useSchool();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingSchool, setIsDetectingSchool] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [geoData, setGeoData] = useState<{ country?: string; ip?: string; city?: string } | null>(null);
  const { data: mabdcSettings } = useSchoolSettings('MABDC');
  const { data: stfxsaSettings } = useSchoolSettings('STFXSA');

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Initial geo-detection for international users
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setGeoData({ country: data.country, ip: data.ip, city: data.city });

        if (data.country === 'PH') {
          setSelectedSchool('STFXSA');
        } else if (data.country === 'AE') {
          setSelectedSchool('MABDC');
        }
      } catch (err) {
        console.error('Geolocation detection failed:', err);
      }
    };

    detectLocation();
  }, [setSelectedSchool]);

  // Smart School Detection based on LRN
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const input = loginData.email.trim();
      // Only detect for LRNs (numbers only or alphanumeric without @)
      if (!input || input.includes('@') || input.length < 5) return;

      setIsDetectingSchool(true);
      try {
        const { data: student } = await supabase
          .from('students')
          .select('school')
          .eq('lrn', input)
          .maybeSingle();

        if (student) {
          const studentSchool = student.school?.toUpperCase() || 'MABDC';
          const isSTFXSA = studentSchool.includes('STFXSA') || studentSchool.includes('ST. FRANCIS');
          setSelectedSchool(isSTFXSA ? 'STFXSA' : 'MABDC');
        }
      } catch (err) {
        console.error('School detection check failed:', err);
      } finally {
        setIsDetectingSchool(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [loginData.email, setSelectedSchool]);

  const logAudit = async (action: string, status: string, error?: string) => {
    try {
      // Cast to any because audit_logs might not be in the generated types yet
      await (supabase.from('audit_logs') as any).insert({
        lrn: loginData.email.includes('@') ? null : loginData.email,
        action,
        status,
        ip_address: geoData?.ip,
        country_code: geoData?.country,
        city: geoData?.city,
        school: selectedSchool,
        error_message: error,
        user_agent: navigator.userAgent
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      toast.error(`Too many failed attempts. Please wait ${remainingSeconds} seconds.`);
      return;
    }

    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    await logAudit('login_attempt', 'pending');

    const cleanLrn = loginData.email.trim().replace(/[^a-zA-Z0-9]/g, '');
    const emailToUse = loginData.email.includes('@')
      ? loginData.email.trim()
      : (selectedSchool === 'STFXSA' ? `${cleanLrn}@stfxsa.org` : `${cleanLrn}@mabdc.org`);

    const { error } = await signIn(emailToUse, loginData.password);
    setIsSubmitting(false);

    if (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 5) {
        setLockoutUntil(Date.now() + 30000); // 30 sec lockout
        toast.error('Too many failed attempts. Login locked for 30 seconds.');
      } else {
        toast.error(error.message.includes('Invalid login credentials')
          ? 'Invalid LRN/email or password.'
          : error.message);
      }

      await logAudit('login_failure', 'failure', error.message);
    } else {
      setFailedAttempts(0);
      setLockoutUntil(null);
      await logAudit('login_success', 'success');
      toast.success('Logged in successfully');
      navigate('/');
    }
  };

  const currentTheme = SCHOOL_THEMES[selectedSchool];
  const currentSettings = selectedSchool === 'MABDC' ? mabdcSettings : stfxsaSettings;

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br",
        selectedSchool === 'MABDC' ? "from-emerald-600 to-lime-400" : "from-blue-600 to-indigo-500"
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-all duration-500 bg-gradient-to-br",
      selectedSchool === 'MABDC' ? "from-emerald-600 to-lime-400" : "from-blue-600 to-indigo-500"
    )}>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          {/* School Tabs */}
          <Tabs
            value={selectedSchool}
            onValueChange={(v) => setSelectedSchool(v as SchoolType)}
            className="w-full mb-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="MABDC"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                MABDC
              </TabsTrigger>
              <TabsTrigger
                value="STFXSA"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                STFXSA
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className={cn(
            "mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden transition-all duration-500",
            selectedSchool === 'MABDC' ? "bg-emerald-100" : "bg-blue-100"
          )}>
            {isDetectingSchool ? (
              <div className="animate-pulse bg-slate-200 w-full h-full flex items-center justify-center">
                <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : currentSettings?.logo_url ? (
              <img
                src={currentSettings.logo_url}
                alt={currentSettings.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center bg-gradient-to-br",
                selectedSchool === 'MABDC' ? "from-emerald-600 to-lime-400" : "from-blue-600 to-indigo-500"
              )}>
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold transition-colors duration-500">
            {currentSettings?.name || currentTheme.fullName}
          </CardTitle>
          <CardDescription>Unified Smart Login Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="login-email">LRN / Email</Label>
                {isDetectingSchool && <span className="text-[10px] text-muted-foreground animate-pulse">Detecting school...</span>}
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email or LRN"
                  className="pl-10"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r transition-all duration-300",
                selectedSchool === 'MABDC'
                  ? "from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600"
                  : "from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
              )}
              disabled={isSubmitting || (lockoutUntil ? Date.now() < lockoutUntil : false)}
            >
              {isSubmitting ? 'Signing in...' : `Sign In to Portal`}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
            <p>Your login location and IP are being logged for security</p>
            <p>Detection: {geoData?.country || 'Searching...'} | Theme: {selectedSchool}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden manual switch for emergency use */}
      <div className="fixed bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
        <Tabs value={selectedSchool} onValueChange={(v) => setSelectedSchool(v as SchoolType)}>
          <TabsList>
            <TabsTrigger value="MABDC">M</TabsTrigger>
            <TabsTrigger value="STFXSA">S</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
