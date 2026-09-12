export function isSimulator() {
  return import.meta.env.VITE_SIMULATOR === 'true';
}
