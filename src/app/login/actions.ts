'use server';

import { cookies } from 'next/headers';

export async function authenticate(password: string) {
  const correctPassword = process.env.APP_PASSWORD || '8520';

  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return { success: true };
  }

  return { success: false };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
