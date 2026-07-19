/**
 * api.js
 * Thin fetch wrapper around the Flask backend documented in README.md.
 * Every call is same-origin (this page is served BY the same Flask app),
 * so there's no CORS setup to worry about.
 *
 * NOTE: exact response field names (e.g. `nama` vs `name`) aren't
 * confirmed yet — Backend/admin/profiles.py, Backend/utama/utama.py and
 * Backend/admin/upload.py weren't shared, so this file makes a
 * best-effort guess with fallbacks. If real field names differ, this is
 * the only file that needs updating — nothing else touches raw API data.
 */

const BASE_URL = "/api";

async function fetchJSON(endpoint) {
  try {
    const controller = new AbortController();
    // Tingkatkan timeout menjadi 120 detik karena TiDB Serverless bisa sangat lama saat cold start (tercatat hingga 68 detik)
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    const res = await fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Request to ${endpoint} failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[api] ${endpoint} unavailable or timed out, falling back:`, error);
    return null;
  }
}

/** Unwraps common API response shapes: raw object, or { data: {...} }. */
function unwrap(raw) {
  if (raw && typeof raw === "object" && "data" in raw) return raw.data;
  return raw;
}

export async function getProfil() {
  return unwrap(await fetchJSON("/profil"));
}

export async function getExperiences() {
  const raw = unwrap(await fetchJSON("/experiences"));
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getProjects() {
  const raw = unwrap(await fetchJSON("/projects"));
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getSkills() {
  const raw = unwrap(await fetchJSON("/skills"));
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getCaseStudies() {
  const raw = unwrap(await fetchJSON("/case-studies"));
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getBlogs() {
  const raw = unwrap(await fetchJSON("/blogs-public"));
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

/** Reads a value from an object trying several possible key names. */
export function pick(obj, keys, fallback = "") {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return fallback;
}
