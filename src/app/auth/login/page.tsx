import AuthLayout from '@/components/login/auth/auth-layout';
import LoginForm from '@/components/login/auth/login-form';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}