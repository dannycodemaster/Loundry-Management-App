import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Sparkles } from 'lucide-react';
import laundryBg from '@/assets/laundry-bg.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <img src={laundryBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div className="w-full max-w-md animate-fade-in text-center relative z-10">
        <div className="mb-10">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">FreshPress</h1>
          <p className="text-muted-foreground text-sm mt-2">Dry Cleaning Management System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/auth')}
            className="w-full flex items-center gap-4 rounded-xl border border-border bg-card/90 backdrop-blur p-5 hover:bg-card transition-colors text-left group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Admin Login</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer-portal')}
            className="w-full flex items-center gap-4 rounded-xl border border-border bg-card/90 backdrop-blur p-5 hover:bg-card transition-colors text-left group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Customer Login</p>
              <p className="text-xs text-muted-foreground mt-0.5">Track your orders & payment status</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} FreshPress. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
