import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';
import { Lock } from 'lucide-react';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ password }) {
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success('Password updated! You can now sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account." variant="login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="New password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          hint="Min 8 chars, one uppercase, one number"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
