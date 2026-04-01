import { motion, useReducedMotion } from 'framer-motion';

const FlyingEagleLoader = ({
  size = 'md',
  label = 'Loading',
  className = '',
  centered = true
}) => {
  const reduceMotion = useReducedMotion();

  const sizeClass = {
    sm: 'w-20 h-14',
    md: 'w-28 h-20',
    lg: 'w-36 h-24'
  }[size] || 'w-28 h-20';

  const wrapperClasses = centered
    ? `flex flex-col items-center justify-center ${className}`
    : `flex flex-col items-center ${className}`;

  return (
    <div className={wrapperClasses} role="status" aria-live="polite" aria-label={label}>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: [0.8, 1, 0.95, 1],
                x: [-14, 0, 14, 0, -14],
                y: [3, -6, 2, -4, 3],
                rotate: [-2.5, 1, 2.5, 0, -2.5]
              }
        }
        transition={{
          duration: reduceMotion ? 0.2 : 2.9,
          ease: 'easeInOut',
          repeat: reduceMotion ? 0 : Infinity
        }}
      >
        <motion.img
          src="/logo.png"
          alt="Garuda Eagle"
          className={`${sizeClass} object-contain select-none pointer-events-none`}
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.03, 0.99, 1.02, 1],
                  filter: [
                    'drop-shadow(0 5px 10px rgba(37,99,235,0.16))',
                    'drop-shadow(0 8px 14px rgba(16,185,129,0.22))',
                    'drop-shadow(0 5px 10px rgba(37,99,235,0.16))'
                  ]
                }
          }
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: reduceMotion ? 0 : Infinity }}
          draggable="false"
        />
      </motion.div>

      <p className="mt-2 text-sm text-gray-600">{label}</p>
    </div>
  );
};

export default FlyingEagleLoader;