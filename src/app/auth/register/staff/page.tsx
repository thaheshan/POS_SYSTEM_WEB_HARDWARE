import AuthLayout from '@/components/login/auth/auth-layout';
import SignupTypeSelector from '@/components/login/auth/signup-type-selector';

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupTypeSelector />
    </AuthLayout>
  );
}