import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CalculatorSkeleton } from '../components/Skeleton/Skeleton';

const RepeatCalculatorPage = lazy(() => import('../pages/RepeatCalculatorPage/RepeatCalculatorPage'));
const NotFoundPage         = lazy(() => import('../pages/NotFoundPage/NotFoundPage'));

function PageFallback() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <CalculatorSkeleton />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageFallback />}>
        <RepeatCalculatorPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;
