'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { fetchWithAuth } from '@/lib/fetchWithAuth';

type Metal = {
	_id: string;
	metal_name: string;
	metal_price: number;
	createdAt?: string;
	updatedAt?: string;
};

type MetalFormState = {
	metal_name: string;
	metal_price: string;
};

const emptyForm: MetalFormState = {
	metal_name: '',
	metal_price: '',
};

export default function MetalsManagement() {
	const [metals, setMetals] = useState<Metal[]>([]);
	const [formState, setFormState] = useState<MetalFormState>(emptyForm);
	const [editingMetalId, setEditingMetalId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	async function loadMetals() {
		try {
			setError('');
			const response = await fetch('/api/metals', { cache: 'no-store' });

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to load metals');
			}

			const data = await response.json();
			setMetals(data.metals || []);
		} catch (err: any) {
			setError(err.message || 'Failed to load metals');
		}
	}

	useEffect(() => {
		loadMetals();
	}, []);

	function openCreateModal() {
		setEditingMetalId(null);
		setFormState(emptyForm);
		setMessage('');
		setError('');
		setIsModalOpen(true);
	}

	function openEditModal(metal: Metal) {
		setEditingMetalId(metal._id);
		setFormState({
			metal_name: metal.metal_name,
			metal_price: String(metal.metal_price),
		});
		setMessage('');
		setError('');
		setIsModalOpen(true);
	}

	async function saveMetal(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setMessage('');
		setError('');

		const trimmedName = formState.metal_name.trim();
		const price = Number(formState.metal_price);

		if (!trimmedName) {
			setError('Metal name is required');
			setSaving(false);
			return;
		}

		if (!formState.metal_price || Number.isNaN(price)) {
			setError('Metal price must be a valid number');
			setSaving(false);
			return;
		}

		try {
			const response = await fetchWithAuth(
				editingMetalId ? `/api/admin/metals/${editingMetalId}` : '/api/admin/metals',
				{
					method: editingMetalId ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						metal_name: trimmedName,
						metal_price: price,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to save metal');
			}

			setMessage(editingMetalId ? 'Metal updated successfully' : 'Metal created successfully');
			setIsModalOpen(false);
			setFormState(emptyForm);
			setEditingMetalId(null);
			await loadMetals();
		} catch (err: any) {
			setError(err.message || 'Failed to save metal');
		} finally {
			setSaving(false);
		}
	}

	async function deleteMetal(metalId: string) {
		if (!window.confirm('Are you sure you want to delete this metal?')) return;

		setLoading(true);
		setMessage('');
		setError('');

		try {
			const response = await fetchWithAuth(`/api/admin/metals/${metalId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to delete metal');
			}

			setMessage('Metal deleted successfully');
			await loadMetals();
		} catch (err: any) {
			setError(err.message || 'Failed to delete metal');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6 px-0 dark:text-zinc-100">
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

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-xl sm:border sm:border-zinc-200 sm:bg-white sm:px-4 sm:py-4 sm:shadow-sm dark:sm:border-zinc-800 dark:sm:bg-zinc-900">
				<div>
					<h2 className="text-xl font-semibold">Metals</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Load all metal entries from <span className="font-medium">/api/metals</span> and manage them here.
					</p>
				</div>

				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <button
						type="button"
						onClick={openCreateModal}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
					>
						Add Metal
					</button>
					<button
						type="button"
						onClick={loadMetals}
						className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
					>
						Refresh
					</button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{metals.length === 0 ? (
					<div className="rounded-none border-y border-dashed border-zinc-300 bg-transparent px-0 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 md:col-span-2 xl:col-span-3 sm:rounded-xl sm:border sm:bg-white sm:px-4 sm:shadow-sm dark:sm:bg-zinc-900">
						No metals found.
					</div>
				) : (
					metals.map((metal) => (
						<div
							key={metal._id}
							className="rounded-none border-b border-zinc-200 bg-transparent px-0 py-4 shadow-none last:border-b-0 dark:border-zinc-800 sm:rounded-xl sm:border sm:bg-white sm:p-5 sm:shadow-sm dark:sm:border-zinc-800 dark:sm:bg-zinc-900"
						>
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="text-lg font-semibold">{metal.metal_name}</h3>
									<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
										Price: {metal.metal_price}
									</p>
								</div>

								<span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
									Metal
								</span>
							</div>

							<div className="mt-5 flex gap-3">
								<button
									type="button"
									onClick={() => openEditModal(metal)}
									className="rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
								>
									Edit
								</button>
								<button
									type="button"
									onClick={() => deleteMetal(metal._id)}
									disabled={loading}
									className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
								>
									Delete
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
					<div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
						<div className="mb-6 flex items-start justify-between gap-4">
							<div>
								<h3 className="text-2xl font-semibold">
									{editingMetalId ? 'Edit Metal' : 'Add Metal'}
								</h3>
								<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
									{editingMetalId ? 'Update the selected metal entry.' : 'Create a new metal entry.'}
								</p>
							</div>

							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
							>
								Close
							</button>
						</div>

						<form onSubmit={saveMetal} className="space-y-4">
							<div>
								<label className="mb-2 block text-sm font-medium" htmlFor="metalName">
									Metal Name
								</label>
								<input
									id="metalName"
									value={formState.metal_name}
									onChange={(e) => setFormState((current) => ({ ...current, metal_name: e.target.value }))}
									className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
									placeholder="Enter metal name"
									required
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" htmlFor="metalPrice">
									Metal Price
								</label>
								<input
									id="metalPrice"
									type="number"
									value={formState.metal_price}
									onChange={(e) => setFormState((current) => ({ ...current, metal_price: e.target.value }))}
									className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
									placeholder="Enter metal price"
									required
								/>
							</div>

							<div className="flex gap-3 pt-2">
								<button
									type="submit"
									disabled={saving}
									className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
								>
									{saving ? 'Saving...' : editingMetalId ? 'Update Metal' : 'Create Metal'}
								</button>
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
