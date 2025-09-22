import { Suspense } from 'react';
import OrderPageClient from '@/components/OrderPageClient';

function OrderPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Loading order...</div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageFallback />}>
      <OrderPageClient />
    </Suspense>
  );
}