import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ─── Schemas replicated from page files for unit testing ─────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['backer', 'campaigner']),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

describe('Login schema', () => {
  it('accepts valid credentials', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: 'secret1' })).not.toThrow();
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'secret1' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/valid email/i);
  });

  it('rejects password shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/6 characters/i);
  });
});

describe('Register schema', () => {
  const valid = { name: 'John', email: 'a@b.com', password: 'Secret123', role: 'backer' };

  it('accepts valid registration', () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('Reset password schema', () => {
  const valid = { password: 'Secret123', confirmPassword: 'Secret123' };

  it('accepts valid matching passwords', () => {
    expect(() => resetPasswordSchema.parse(valid)).not.toThrow();
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'Different1' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/do not match/i);
  });

  it('rejects password without uppercase', () => {
    const result = resetPasswordSchema.safeParse({ password: 'secret123', confirmPassword: 'secret123' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/uppercase/i);
  });

  it('rejects password without number', () => {
    const result = resetPasswordSchema.safeParse({ password: 'SecretPass', confirmPassword: 'SecretPass' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/number/i);
  });
});
// frontend unit tests — components, pages, and form validation
