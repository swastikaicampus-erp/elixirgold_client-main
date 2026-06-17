/**
 * Admin API service with automatic logout on token expiry (401)
 */
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export interface CarouselImage {
  _id: string;
  imageData: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCarouselResponse {
  images: CarouselImage[];
  image?: CarouselImage;
  message?: string;
}

// Carousel management
export async function getCarouselImages(): Promise<CarouselImage[]> {
  const response = await fetchWithAuth("/api/admin/carousel");

  if (!response.ok) {
    throw new Error(`Failed to fetch carousel images: ${response.status}`);
  }

  const data = (await response.json()) as AdminCarouselResponse;
  return data.images ?? [];
}

export async function createCarouselImage(imageData: string): Promise<CarouselImage> {
  const response = await fetchWithAuth("/api/admin/carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create carousel image: ${response.status}`);
  }

  const data = (await response.json()) as AdminCarouselResponse;
  return data.image!;
}

export async function deleteCarouselImage(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/admin/carousel/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete carousel image: ${response.status}`);
  }
}

// City management
export async function getCities() {
  const response = await fetchWithAuth("/api/admin/cities");

  if (!response.ok) {
    throw new Error(`Failed to fetch cities: ${response.status}`);
  }

  return await response.json();
}

export async function createCity(cityData: any) {
  const response = await fetchWithAuth("/api/admin/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cityData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create city: ${response.status}`);
  }

  return await response.json();
}

export async function updateCity(id: string, cityData: any) {
  const response = await fetchWithAuth(`/api/admin/cities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cityData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update city: ${response.status}`);
  }

  return await response.json();
}

export async function deleteCity(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/admin/cities/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete city: ${response.status}`);
  }
}

// User management
export async function getUsers() {
  const response = await fetchWithAuth("/api/admin/users");

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  return await response.json();
}

export async function updateUserRole(id: string, role: string) {
  const response = await fetchWithAuth("/api/admin/set-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id, role }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user role: ${response.status}`);
  }

  return await response.json();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await fetchWithAuth("/api/admin/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(`Failed to change password: ${response.status}`);
  }

  return await response.json();
}
