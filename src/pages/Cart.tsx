import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { useCart } from "@/hooks/useCart";
import { CartSlot } from "@/components/marketplace/CartSlot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { items, isLoading, periodLabel, removeFromCart } = useCart();

  const coreItems = items.filter(i => i.cart_role === 'core');
  const supportItems = items.filter(i => i.cart_role === 'support');
  const optionalItems = items.filter(i => i.cart_role === 'optional');

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />
      <div className="max-w-3xl mx-auto px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('marketplace.backToMarketplace')}
          </Button>
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('marketplace.myPlan')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('marketplace.periodLabel')}: <Badge variant="outline" className="text-xs ml-1">{periodStart}</Badge>
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 animate-slide-up">
            <CartSlot role="core" items={coreItems} onRemove={removeFromCart} />
            <CartSlot role="support" items={supportItems} onRemove={removeFromCart} />
            <CartSlot role="optional" items={optionalItems} onRemove={removeFromCart} />

            {items.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{t('marketplace.emptyCart')}</p>
                <Button onClick={() => navigate("/marketplace")}>
                  {t('marketplace.browsePractices')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
