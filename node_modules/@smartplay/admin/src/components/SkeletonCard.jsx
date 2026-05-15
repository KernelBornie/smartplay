const SkeletonCard = () => {
  return (
    <div style={styles.card}>
      <div style={styles.coverSkeleton} />
      <div style={styles.titleSkeleton} />
      <div style={styles.artistSkeleton} />
    </div>
  );
};

const styles = {
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    minWidth: '180px',
    maxWidth: '180px',
  },
  coverSkeleton: {
    width: '148px',
    height: '148px',
    borderRadius: '8px',
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '12px',
  },
  titleSkeleton: {
    height: '16px',
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  artistSkeleton: {
    height: '12px',
    width: '80%',
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
  },
};

export default SkeletonCard;
