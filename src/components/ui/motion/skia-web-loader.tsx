import { use } from 'react';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

let skiaLoadPromise: Promise<void> | null = null;

function loadSkiaForWeb() {
  if (!skiaLoadPromise) skiaLoadPromise = LoadSkiaWeb();
  return skiaLoadPromise;
}

export function SkiaWebLoader() {
  use(loadSkiaForWeb());
  return null;
}
