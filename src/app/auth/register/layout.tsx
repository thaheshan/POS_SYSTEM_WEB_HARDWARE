import { RegistrationProvider } from '@/lib/register/registration-context';
import { register } from 'module';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegistrationProvider>
      {children}
    </RegistrationProvider>
  );
}
