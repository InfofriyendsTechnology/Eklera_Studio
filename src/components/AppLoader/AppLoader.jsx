import { motion } from 'framer-motion';
import logoIcon from '../../assets/logo-icon.webp';
import styles from './AppLoader.module.scss';

export default function AppLoader() {
  return (
    <div className={styles.overlay}>

      <motion.div
        className={styles.logoWrap}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Always-visible dim track ring */}
        <div className={styles.ringBg} />

        {/* Spinning accent arc */}
        <div className={styles.ring} />

        {/* Logo — full size, no clipping */}
        <motion.img
          src={logoIcon}
          alt="Eklera Studio"
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      <motion.span
        className={styles.tag}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        Repeat Calculator
      </motion.span>

    </div>
  );
}
