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
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <AppLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && <RouterProvider router={router} />}
    </>
  );
}
