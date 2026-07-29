import { Suspense } from 'react';
import RouteFallback from './RouteFallback';

export default function LazyPage({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
