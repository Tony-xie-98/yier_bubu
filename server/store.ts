import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(import.meta.dirname, 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJSON<T>(file: string, fallback: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, file);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch { /* ignore */ }
  writeJSON(file, fallback);
  return fallback;
}

export function writeJSON<T>(file: string, data: T): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}
