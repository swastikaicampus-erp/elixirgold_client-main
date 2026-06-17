import { setStoredAuthToken } from '@/lib/auth-token';

export interface AuthUser {
  role?: string;
  name?: string;
  storeName?: string;
  contactNumber?: string;
  storeAddress?: string;
}

export interface AuthResponse {
  message?: string;
  user?: AuthUser;
  token?: string;
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  try {
    return (await response.json()) as AuthResponse;
  } catch {
    return {};
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseAuthResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  if (data.token) {
    setStoredAuthToken(data.token);
  }

  return data;
}

export async function registerUser(input: {
  name: string;
  storeName: string;
  contactNumber: string;
  storeAddress: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      storeName: input.storeName.trim(),
      contactNumber: input.contactNumber.trim(),
      storeAddress: input.storeAddress.trim(),
      email: input.email.trim(),
      password: input.password,
    }),
  });

  const data = await parseAuthResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
}