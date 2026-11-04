// Local replacement for the countriesnow.space API (#43).
// Static, free and private: no request leaves the site. It returns the same JSON shapes
// countriesnow returned, so the existing form logic did not need to be rewritten.
// Cities are typed freely (a full world city list would weigh several MB and the only
// common npm dataset is GPL-3.0, which is not suitable for this project).
// Author: Ryan Naidji
import { US_STATES } from './locationOptions';

export const COUNTRIES = ['United States', 'Canada', 'Mexico', 'Puerto Rico', 'United Kingdom', 'Nigeria'] as const;

const US_STATE_NAMES: string[] = US_STATES.map((s) => s.name).sort();

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same loose typing as fetch().json()
type LocationsResponse = { json: () => Promise<any> };

/** Drop-in for `fetch('https://countriesnow.space/api/v0.1/<path>', init)`. */
export function fetchLocations(path: string, init?: RequestInit): Promise<LocationsResponse> {
  let body: { country?: string } = {};
  try {
    body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
  } catch {
    body = {};
  }

  let data: unknown;
  if (path.endsWith('countries/states')) {
    data = { states: body.country === 'United States' ? US_STATE_NAMES.map((name) => ({ name })) : [] };
  } else if (path.endsWith('countries/state/cities')) {
    data = []; // cities are free text
  } else {
    data = COUNTRIES.map((country) => ({ country, cities: [] as string[] }));
  }
  return Promise.resolve({ json: () => Promise.resolve({ error: false, data }) });
}
