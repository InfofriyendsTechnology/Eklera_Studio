import styles from './Skeleton.module.scss';

/** Single skeleton line */
export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: '6px' }}
      aria-hidden
    />
  );
}

/** Skeleton for the main calculator card */
export function CalculatorSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      {/* machine row */}
      <div className={styles.skRow}>
        <SkeletonLine width="30%" height="0.75rem" />
        <SkeletonLine width="100%" height="52px" />
      </div>
      <div className={styles.divider} />
      {/* input row */}
      <div className={styles.skRow}>
        <SkeletonLine width="40%" height="0.75rem" />
        <SkeletonLine width="100%" height="68px" />
      </div>
    </div>
  );
}

/** Skeleton for the result section */
export function ResultSkeleton() {
  return (
    <div className={styles.resultSkeleton}>
      <SkeletonLine width="25%" height="0.7rem" />
      <div className={styles.resultSkCard}>
        <SkeletonLine width="46px" height="46px" className={styles.skCircle} />
        <div className={styles.skTextGroup}>
          <SkeletonLine width="40%" height="0.7rem" />
          <SkeletonLine width="55%" height="2.5rem" />
          <SkeletonLine width="70%" height="0.8rem" />
        </div>
      </div>
    </div>
  );
}
