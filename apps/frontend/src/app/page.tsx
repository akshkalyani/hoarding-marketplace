'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            India&apos;s #1 OOH Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Book outdoor ads<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              across India
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The B2B marketplace for hoardings, kiosks, gantries, and transit media.
            Browse inventory, build multi-listing deals, and negotiate — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 text-center"
            >
              Browse Marketplace
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-center"
              >
                Get Started — Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">500+</p>
            <p className="text-sm text-gray-500 mt-1">Active Listings</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">120+</p>
            <p className="text-sm text-gray-500 mt-1">Cities Covered</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹2Cr+</p>
            <p className="text-sm text-gray-500 mt-1">Deals Closed</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">200+</p>
            <p className="text-sm text-gray-500 mt-1">Media Partners</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Whether you own media or buy it, AdMax makes outdoor advertising simple.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-5">1</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">List or Browse</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Media owners list their inventory with photos, pricing, and availability. Agencies browse and filter across cities.
            </p>
          </div>
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mb-5">2</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Build Deals</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Add multiple listings to your deal cart, set a negotiated price, and send an offer directly to the owner.
            </p>
          </div>
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mb-5">3</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Chat & Close</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Negotiate over built-in messaging, accept offers, and close deals — all tracked in your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to grow your outdoor advertising?</h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">Join hundreds of media owners and agencies already using AdMax.</p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AdMax. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/marketplace" className="hover:text-gray-600 transition-colors">Marketplace</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
