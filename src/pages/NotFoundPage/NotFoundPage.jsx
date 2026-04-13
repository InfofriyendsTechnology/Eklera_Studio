import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiHome, HiExclamationTriangle } from 'react-icons/hi2';
import styles from './NotFoundPage.module.scss';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Animated icon */}
        <motion.div
          className={styles.iconWrap}
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        >
          <HiExclamationTriangle size={48} />
        </motion.div>

        {/* 404 number */}
        <motion.div
          className={styles.code}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          404
        </motion.div>

        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          Aa page exist nathi karto.<br />
          Repeat calculator par vapas jao.
        </p>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link to="/" className={styles.homeBtn}>
            <HiHome size={18} />
            <span>Calculator par Jao</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative blobs */}
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />
    </div>
  );
}
