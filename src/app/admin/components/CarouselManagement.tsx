'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function CarouselManagement() {
  const [carouselImages, setCarouselImages] = useState<{ _id: string, imageData: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadCarouselImages() {
    try {
      const response = await fetch('/api/carousel');
      if (!response.ok) throw new Error('Failed to load carousel images');
      const data = await response.json();
      setCarouselImages(data.images || []);
    } catch (err: any) {
      console.error('Failed to load carousel images', err);
    }
  }

  useEffect(() => {
    loadCarouselImages();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imagePreview) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetchWithAuth('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imagePreview }),
      });

      if (!response.ok) throw new Error('Failed to upload image');

      setMessage('✅ Image uploaded successfully!');
      setImagePreview('');
      
      const fileInput = document.getElementById('carouselImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await loadCarouselImages();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const deleteCarouselImage = async (id: string) => {
    setError('');
    setMessage('');
    try {
      const response = await fetchWithAuth(`/api/admin/carousel/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete image');
      setMessage('Image deleted successfully');
      await loadCarouselImages();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

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
        <form onSubmit={uploadImage} className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Upload Carousel Image</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Upload images to display in the main page carousel. Max size: ~5MB.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="carouselImage">
              Select Image
            </label>
            <input
              id="carouselImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              required
            />
          </div>

          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md border border-zinc-300 dark:border-zinc-700" />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !imagePreview}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Carousel Images</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage currently active carousel images. Default images will be shown if none are uploaded.
              </p>
            </div>
            <button
              type="button"
              onClick={loadCarouselImages}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {carouselImages.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No images uploaded. The main page will use the default static images.
              </div>
            ) : (
              carouselImages.map((img) => (
                <div
                  key={img._id}
                  className="relative group rounded-lg border border-zinc-200 overflow-hidden dark:border-zinc-800"
                >
                  <img src={img.imageData} alt="Carousel item" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => deleteCarouselImage(img._id)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
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
