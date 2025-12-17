import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">{t('notFound.title')}</h1>
          <p className="mb-4 text-xl text-muted-foreground">{t('notFound.message')}</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            {t('notFound.returnHome')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
