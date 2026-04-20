import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { Mail, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ email }) {
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message ?? 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="A password reset link has been sent." variant="login">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <p className="text-sm text-ink-600">
            We&apos;ve sent a reset link to your email. Click it to choose a new password.
            The link expires in 1 hour.
          </p>
          <p className="text-xs text-ink-400">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              className="text-primary-700 font-semibold hover:underline"
              onClick={() => setSent(false)}
            >
              try again
            </button>.
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm font-bold text-primary-700 hover:text-primary-800">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send a reset link." variant="login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
