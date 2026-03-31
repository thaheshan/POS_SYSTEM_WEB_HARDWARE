import { SubscriptionFlow } from '@/components/auth/register/subscription\/SubscriptionFlow';

export const metadata = {
  title: 'Subscribe - POS Store',
  description: 'Choose your perfect plan and start your free trial today',
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <SubscriptionFlow />
    </main>
  );
}
