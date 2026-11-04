// Open documents stored by the API (#59).
// Resumes and cover letters are private: they are fetched with the user's token and opened
// from a temporary local URL. Public files (logos, Cloudinary URLs) open directly.
// Author: Ryan Naidji
import { authFetch } from './session';

export async function openProtectedFile(url: string): Promise<boolean> {
  if (!url.includes('/api/v1/files/')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
  const res = await authFetch(url);
  if (!res.ok) return false;
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'document';
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  return true;
}
