import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-80px)] p-8 text-center">
      <div className="max-w-md space-y-6 bg-[#0a0a0a] border border-[#3c321e] p-8 rounded-2xl shadow-xl">
        <div className="mx-auto w-16 h-16 bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-900/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f5d993]">Access Denied</h1>
        <p className="text-zinc-400 text-lg">
          You don't have access because you are not an admin. 
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex justify-center rounded-xl border border-[#5a4a2b] bg-[#171717] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5d993] hover:bg-[#1a1a1a] hover:border-[#d3b475] hover:shadow-[0_0_15px_rgba(211,180,117,0.1)] transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
