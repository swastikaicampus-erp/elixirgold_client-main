'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/config/site';
import { clearStoredAuthToken } from '@/lib/auth-token';

interface HeaderProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export default function Header({ isLoggedIn = false, isAdmin = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearStoredAuthToken();
    setIsMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  const isOnAdminPanel = pathname.startsWith('/admin');

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="w-full border-b border-[#3c321e] bg-[#060606] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3 font-display text-2xl font-semibold tracking-wide text-[#f2d792] transition-colors hover:text-[#f7e6b0]"
        >
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={60}
            height={20}
            className="h-auto w-auto object-contain"
            priority
          />
          <span>{siteConfig.name}</span>
        </Link>

        <div className="relative flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-xl border border-[#5a4a2b] bg-[#171717] p-3 text-[#f5d993] transition-all hover:border-[#d3b475] hover:bg-[#1a1a1a] hover:shadow-[0_0_15px_rgba(211,180,117,0.1)]"
          >
            <span className="sr-only">Open menu</span>
            <span className="flex h-4 w-5 flex-col justify-between">
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
            </span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-[#3c321e] bg-[#0d0d0d] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
              {isAdmin && !isOnAdminPanel && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5d993] transition-colors hover:bg-[#171717] hover:text-[#f7e6b0]"
                >
                  Admin Panel
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f5d993] transition-colors hover:bg-[#171717] hover:text-[#f7e6b0]"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5d993] transition-colors hover:bg-[#171717] hover:text-[#f7e6b0]"
                >
                  Login
                </Link>
              )}

              <div className="mt-2 border-t border-[#2f2717] pt-2">
              
                <div className="space-y-1">
                  {siteConfig.adminPortals.map((branch) => (
                    <a
                      key={branch.name}
                      href={branch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5d993] transition-colors hover:border-[#5a4a2b] hover:bg-[#171717] hover:text-[#f7e6b0]"
                    >
                      {branch.name}
                    </a>
                  ))}
                </div>
              </div>
            
                 <Link
                  href="#"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5d993] transition-colors hover:bg-[#171717] hover:text-[#f7e6b0]"
                >
                  Trading 
                </Link>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
