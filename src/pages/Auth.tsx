import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Phone, ArrowRight, KeyRound } from 'lucide-react';

const ALLOWED_ADMIN_EMAILS = [
  'danieldavid1200@gmail.com',
  'wakwedavid9@gmail.com',
];

const Auth = () => {
  const { signInWithOtp, verifyOtp } = useAuth();
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'contact' | 'otp'>('contact');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'email' && !ALLOWED_ADMIN_EMAILS.includes(contact.toLowerCase().trim())) {
      toast.error('This email is not authorized for admin access');
      return;
    }
    setLoading(true);
    const { error } = await signInWithOtp(contact);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`OTP sent to ${contact}`);
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await verifyOtp(contact, otp);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">✨ FreshPress</h1>
          <p className="text-muted-foreground text-sm mt-2">Staff Login</p>
        </div>

        {step === 'contact' ? (
          <form onSubmit={handleSendOtp} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setMode('email'); setContact(''); }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${mode === 'email' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                <Mail className="h-3 w-3 inline mr-1" /> Email
              </button>
              <button
                type="button"
                onClick={() => { setMode('phone'); setContact(''); }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${mode === 'phone' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                <Phone className="h-3 w-3 inline mr-1" /> Phone
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-card-foreground">
                {mode === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative mt-1">
                {mode === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder={mode === 'email' ? 'you@example.com' : '+234...'}
                  type={mode === 'email' ? 'email' : 'tel'}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send OTP'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the code sent to <span className="font-medium text-card-foreground">{contact}</span>
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="pl-9 text-center tracking-widest text-lg"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button type="button" onClick={() => { setStep('contact'); setOtp(''); }} className="w-full text-xs text-primary hover:underline">
              Use a different {mode === 'email' ? 'email' : 'number'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
