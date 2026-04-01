import { motion, useReducedMotion } from 'framer-motion';

const RevealOnScroll = ({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.15
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: reduceMotion ? 0.2 : 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll;
