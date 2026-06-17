'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { siteConfig } from '@/config/site';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

type CommodityMapping = {
  indianGoldId: string;
  indianSilverId: string;
};

export default function CommodityMappingManagement() {
  const [mapping, setMapping] = useState<CommodityMapping>({
    indianGoldId: '2753',
    indianSilverId: '2754',
  });
  const [rawResponse, setRawResponse] = useState<string>('');
  const [parsedRowsCount, setParsedRowsCount] = useState<number | null>(null);
  const [rawFetchedAt, setRawFetchedAt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [rawLoading, setRawLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rawError, setRawError] = useState('');

  async function loadMapping() {
    const response = await fetchWithAuth('/api/admin/commodity-mapping');

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to load commodity mapping');
    }

    const data = await response.json();
    return {
      indianGoldId: String(data.mapping?.indianGoldId ?? 2753),
      indianSilverId: String(data.mapping?.indianSilverId ?? 2754),
    };
  }

  async function loadRawResponse() {
    setRawLoading(true);
    setRawError('');

    try {
      const response = await fetch(`${siteConfig.api.streamUrl}?_=${Date.now()}`, {
        cache: 'no-store',
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to load raw bcast response (${response.status})`);
      }

      setRawResponse(rawText);
      setParsedRowsCount(null);
      setRawFetchedAt(new Date().toLocaleTimeString('en-IN'));
    } catch (fetchError: unknown) {
      setRawError(fetchError instanceof Error ? fetchError.message : 'Failed to load raw bcast response');
      setRawResponse('');
      setParsedRowsCount(null);
      setRawFetchedAt('');
    } finally {
      setRawLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError('');
        const nextMapping = await loadMapping();

        if (active) {
          setMapping(nextMapping);
        }
      } catch (fetchError: unknown) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load commodity mapping');
        }
      }
    })();

    (async () => {
      await loadRawResponse();
    })();

    return () => {
      active = false;
    };
  }, []);

  async function saveMapping(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const indianGoldId = Number(mapping.indianGoldId);
    const indianSilverId = Number(mapping.indianSilverId);

    if (!Number.isInteger(indianGoldId) || !Number.isInteger(indianSilverId)) {
      setError('Both IDs must be valid integers');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/admin/commodity-mapping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indianGoldId, indianSilverId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update commodity mapping');
      }

      setMessage('✅ Commodity mapping updated successfully!');
      setMapping({
        indianGoldId: String(data.mapping?.indianGoldId ?? indianGoldId),
        indianSilverId: String(data.mapping?.indianSilverId ?? indianSilverId),
      });
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update commodity mapping');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 dark:text-zinc-100">
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={saveMapping} className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Commodity Mapping</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Map bcast commodity IDs to Indian Gold and Indian Silver.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="indianGoldId">
              Indian Gold ID
            </label>
            <input
              id="indianGoldId"
              type="number"
              value={mapping.indianGoldId}
              onChange={(event) => setMapping((current) => ({ ...current, indianGoldId: event.target.value }))}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="2753"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="indianSilverId">
              Indian Silver ID
            </label>
            <input
              id="indianSilverId"
              type="number"
              value={mapping.indianSilverId}
              onChange={(event) => setMapping((current) => ({ ...current, indianSilverId: event.target.value }))}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="2754"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Mapping'}
          </button>
        </form>

        <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold">How It Works</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              The homepage and commodity API read these IDs and use them to resolve Indian Gold/Silver from bcast.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <div className="flex items-center justify-between py-1">
              <span>Indian Gold</span>
              <span className="font-medium">{mapping.indianGoldId}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Indian Silver</span>
              <span className="font-medium">{mapping.indianSilverId}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Raw bcast Response</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Upstream feed used for ID mapping. This is the source before any parsed enrichment.
                </p>
                {rawFetchedAt && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    Last refreshed at {rawFetchedAt}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={loadRawResponse}
                disabled={rawLoading}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {rawLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {rawError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {rawError}
              </div>
            )}

            {parsedRowsCount !== null && (
              <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                Parsed rows: <span className="font-semibold">{parsedRowsCount}</span>
              </div>
            )}

            <pre className="mt-3 max-h-105 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-xs leading-5 text-zinc-100 dark:border-zinc-800">
              {rawResponse || 'Raw response will appear here after loading.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}