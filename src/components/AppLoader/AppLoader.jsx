import { motion } from 'framer-motion';
import styles from './AppLoader.module.scss';

export default function AppLoader() {
  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.logoWrap}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Spinning ring */}
        <div className={styles.ring} />

        {/* E letter mark */}
        <motion.div
          className={styles.letter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          E
        </motion.div>
      </motion.div>

      <motion.p
        className={styles.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        Eklera Studio
      </motion.p>
    </div>
  );
}
