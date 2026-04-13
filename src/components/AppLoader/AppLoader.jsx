import { motion } from 'framer-motion';
import logoIcon from '../../assets/logo-icon.webp';
import styles from './AppLoader.module.scss';

export default function AppLoader() {
  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.logoWrap}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Spinning accent ring */}
        <div className={styles.ring} />

        {/* Actual brand logo */}
        <motion.img
          src={logoIcon}
          alt="Eklera Studio"
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Brand name */}
      <motion.div
        className={styles.brand}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.4 }}
      >
        <span className={styles.brandName}>Eklera Studio</span>
        <span className={styles.brandTag}>Repeat Calculator</span>
      </motion.div>
    </div>
  );
}
