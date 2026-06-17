'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { fetchWithAuth } from '@/lib/fetchWithAuth';

type City = {
  _id: string;
  cityName: string;
  gold_price: number;
  silver_price: number;
};

type PriceEdit = {
  gold: string;
  silver: string;
};

export default function CityManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityName, setCityName] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  const [editPrices, setEditPrices] = useState<Record<string, PriceEdit>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadCities() {
    try {
      setError('');
      const response = await fetchWithAuth('/api/admin/cities');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load cities');
      }

      const data = await response.json();
      setCities(data.cities || []);

      const nextPrices: Record<string, PriceEdit> = {};
      (data.cities || []).forEach((city: City) => {
        nextPrices[city._id] = {
          gold: '',
          silver: '',
        };
      });
      setEditPrices(nextPrices);
    } catch (err: any) {
      setError(err.message || 'Failed to load cities');
    }
  }

  useEffect(() => {
    loadCities();
  }, []);

  async function createCity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!cityName.trim()) {
      setError('City name is required');
      setLoading(false);
      return;
    }

    if (!goldPrice || isNaN(Number(goldPrice))) {
      setError('Gold price must be a valid number');
      setLoading(false);
      return;
    }

    if (!silverPrice || isNaN(Number(silverPrice))) {
      setError('Silver price must be a valid number');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        cityName: cityName.trim(),
        gold_price: Number(goldPrice),
        silver_price: Number(silverPrice),
      };

      const response = await fetchWithAuth('/api/admin/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setMessage('✅ City created successfully!');
      setCityName('');
      setGoldPrice('');
      setSilverPrice('');
      await loadCities();
    } catch (err: any) {
      setError(err.message || 'Failed to create city');
    } finally {
      setLoading(false);
    }
  }

  async function updateCityPrice(cityId: string) {
    setError('');
    setMessage('');

    try {
      const response = await fetchWithAuth(`/api/admin/cities/${cityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gold_price: Number(editPrices[cityId].gold || 0),
          silver_price: Number(editPrices[cityId].silver || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update city');
      }

      setMessage('City prices updated successfully');
      await loadCities();
    } catch (err: any) {
      setError(err.message || 'Failed to update city');
    }
  }

  async function deleteCity(cityId: string) {
    setError('');
    setMessage('');

    try {
      const response = await fetchWithAuth(`/api/admin/cities/${cityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete city');
      }

      setMessage('City deleted successfully');
      await loadCities();
    } catch (err: any) {
      setError(err.message || 'Failed to delete city');
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
        <form onSubmit={createCity} className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Create City</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Add a new city with gold and silver prices.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="cityName">
              City Name
            </label>
            <input
              id="cityName"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Enter city name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="goldPrice">
              Gold Price
            </label>
            <input
              id="goldPrice"
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Enter gold price"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="silverPrice">
              Silver Price
            </label>
            <input
              id="silverPrice"
              type="number"
              value={silverPrice}
              onChange={(e) => setSilverPrice(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Enter silver price"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Create City'}
          </button>
        </form>

        <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Cities</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Update gold and silver prices or delete a city.
              </p>
            </div>
            <button
              type="button"
              onClick={loadCities}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {cities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No cities found. Create one from the form.
              </div>
            ) : (
              cities.map((city) => (
                <div
                  key={city._id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{city.cityName}</h3>
                    </div>

                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor={`gold-${city._id}`}>
                            Gold Adj. (Current: {city.gold_price})
                          </label>
                          <input
                            id={`gold-${city._id}`}
                            type="number"
                            value={editPrices[city._id]?.gold ?? ''}
                            onChange={(e) =>
                              setEditPrices((current) => ({
                                ...current,
                                [city._id]: {
                                  ...current[city._id],
                                  gold: e.target.value,
                                },
                              }))
                            }
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor={`silver-${city._id}`}>
                            Silver Adj. (Current: {city.silver_price})
                          </label>
                          <input
                            id={`silver-${city._id}`}
                            type="number"
                            value={editPrices[city._id]?.silver ?? ''}
                            onChange={(e) =>
                              setEditPrices((current) => ({
                                ...current,
                                [city._id]: {
                                  ...current[city._id],
                                  silver: e.target.value,
                                },
                              }))
                            }
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => updateCityPrice(city._id)}
                        className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        Update Prices
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCity(city._id)}
                        className="w-full sm:w-auto rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
