import { motion, useReducedMotion } from 'framer-motion';

const PageTransition = ({ children, className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
