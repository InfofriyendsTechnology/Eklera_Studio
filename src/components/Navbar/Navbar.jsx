import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectIsDark } from '../../store/themeSlice';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import logoIcon from '../../assets/logo-icon.webp';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const isDark = useSelector(selectIsDark);

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.inner}>
        {/* Brand */}
        <motion.div
          className={styles.brand}
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <img src={logoIcon} alt="Eklera Studio Logo" className={styles.logoImg} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>Eklera Studio</span>
            <span className={styles.brandTag}>Repeat Calculator</span>
          </div>
        </motion.div>

        {/* Right side */}
        <div className={styles.right}>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
