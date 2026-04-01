import { motion, useReducedMotion } from 'framer-motion';

const HeroIntro = ({ children, className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default HeroIntro;
