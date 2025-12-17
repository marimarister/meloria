import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, getTranslation, TranslationKeys } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load language preference
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        // First check localStorage for immediate display
        const storedLang = localStorage.getItem('preferredLanguage') as Language;
        if (storedLang && (storedLang === 'en' || storedLang === 'lv')) {
          setLanguageState(storedLang);
        }

        // Then check if user is authenticated and has a saved preference
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.preferred_language && (profile.preferred_language === 'en' || profile.preferred_language === 'lv')) {
            setLanguageState(profile.preferred_language as Language);
            localStorage.setItem('preferredLanguage', profile.preferred_language);
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguagePreference();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        
        // Load user's language preference
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.preferred_language && (profile.preferred_language === 'en' || profile.preferred_language === 'lv')) {
            setLanguageState(profile.preferred_language as Language);
            localStorage.setItem('preferredLanguage', profile.preferred_language);
          }
        }, 0);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);

    // Save to user account if logged in
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: lang })
          .eq('id', userId);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  }, [userId]);

  const t = useCallback((key: string): string => {
    return getTranslation(translations[language], key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
