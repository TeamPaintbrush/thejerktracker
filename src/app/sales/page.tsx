import { Check } from 'lucide-react';

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            TheJERKTracker Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your restaurant&apos;s pickup tracking needs
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic</h2>
            <p className="text-4xl font-bold text-orange-500 mb-6">$19.99<span className="text-lg font-normal text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Up to 250 orders/month
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                QR code generation
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Basic analytics
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Email support
              </li>
            </ul>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro</h2>
            <p className="text-4xl font-bold text-orange-500 mb-6">$59.99<span className="text-lg font-normal text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Unlimited orders (per location)
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Unlimited QR code generation
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Advanced analytics & reporting
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Custom branding
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                API access
              </li>
            </ul>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition">
              Get Started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h2>
            <p className="text-4xl font-bold text-orange-500 mb-6">Custom<span className="text-lg font-normal text-gray-600"> pricing</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Everything in Pro
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                White-label solution
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Dedicated account manager
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Custom integrations
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                24/7 phone support
              </li>
            </ul>
            <button className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose TheJERKTracker?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h4>
              <p className="text-gray-600">Seamlessly integrate with your existing POS system and delivery apps.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h4>
              <p className="text-gray-600">Provide customers with instant updates on their order status via QR codes.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Boost Efficiency</h4>
              <p className="text-gray-600">Reduce wait times and improve customer satisfaction with automated tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}