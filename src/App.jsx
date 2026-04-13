import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import router from './routes';
import AppLoader from './components/AppLoader/AppLoader';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for minimum 800ms so it doesn't flash
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <AppLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <RouterProvider router={router} />
    </>
  );
}
