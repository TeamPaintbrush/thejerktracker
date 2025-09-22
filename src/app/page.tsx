import Link from 'next/link';
import { ArrowRight, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to TheJERKTracker</h1>
        <p className="text-lg text-gray-600 mb-8">Restaurant Pickup Tracking System</p>
        <div className="space-x-4">
          <Link href="/sales" className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition inline-flex items-center">
            <DollarSign className="mr-2" size={16} />
            View Pricing
          </Link>
          <Link href="/admin" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition inline-flex items-center">
            Go to Admin Dashboard
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
