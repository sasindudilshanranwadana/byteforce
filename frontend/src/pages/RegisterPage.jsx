import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { Mail, Lock, User, Target, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    role: z.enum(['backer', 'campaigner']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ROLES = [
  { value: 'backer',     label: 'I want to back',  icon: Target,  description: 'Discover and fund creators you believe in.' },
  { value: 'campaigner', label: 'I want to raise', icon: Rocket,  description: 'Launch a campaign and raise funds for your project.' },
];

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('backer');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'backer' },
  });

  function selectRole(role) {
    setSelectedRole(role);
    setValue('role', role);
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      await signUp(data);
      toast.success('Account created! Check your email to confirm.', { duration: 5000 });
      navigate('/login');
    } catch (err) {
      toast.error(err.message ?? 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Join Byteforce" subtitle="Build, back, and discover what's next." variant="register">
      <button
        type="button"
        onClick={async () => {
          try { await signInWithGoogle(); }
          catch (err) { toast.error(err.message ?? 'Google sign-in failed'); }
        }}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-sm font-bold text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-all"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-200" /></div>
        <div className="relative flex justify-center text-xs text-ink-400">
          <span className="bg-white px-3 font-semibold uppercase tracking-wider">or with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2 block">I want to…</label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => selectRole(role.value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all',
                    active
                      ? 'border-primary-600 bg-primary-50 shadow-glow'
                      : 'border-ink-200 hover:border-primary-300 hover:bg-ink-50'
                  )}
                >
                  <div className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
                    active ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-500'
                  )}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-ink-900">{role.label}</div>
                    <div className="text-xs text-ink-500 mt-0.5 leading-snug">{role.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('role')} />
        </div>

        <Input
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          leftIcon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="8+ chars, 1 uppercase, 1 number"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
