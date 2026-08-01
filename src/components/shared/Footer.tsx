"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">FixItNow</h3>
          <p className="text-sm text-slate-400">
            Your trusted marketplace for reliable, professional home services
            and repairs.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/services"
                className="hover:text-white transition-colors"
              >
                Browse Services
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="hover:text-white transition-colors"
              >
                Become a Technician
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-white transition-colors"
              >
                Customer Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-4">Popular Services</h4>
          <ul className="space-y-2 text-sm">
            <li>Plumbing & Leak Repairs</li>
            <li>Electrical Wiring</li>
            <li>AC Cleaning & Repair</li>
            <li>Home Cleaning</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <p className="text-sm">
            Need help? Reach out to our support team 24/7.
          </p>
          <p className="text-sm font-medium text-white mt-2">
            support@fixitnow.com
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} FixItNow. All rights reserved.
      </div>
    </footer>
  );
}
