import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi2';
import { toggleTheme, selectIsDark } from '../../store/themeSlice';
import styles from './ThemeToggle.module.scss';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDark);

  return (
    <motion.button
      id="theme-toggle-btn"
      className={styles.toggle}
      onClick={() => dispatch(toggleTheme())}
      whileTap={{ scale: 0.88 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <motion.div
        className={styles.track}
        animate={{ backgroundColor: isDark ? 'rgba(244,160,181,0.18)' : 'rgba(214,84,122,0.12)' }}
      >
        <motion.div
          className={styles.thumb}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ originX: isDark ? 1 : 0 }}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <HiMoon size={14} /> : <HiSun size={14} />}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
