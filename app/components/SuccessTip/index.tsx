import { motion } from "framer-motion";

const SuccessTip: React.FC = () => {
  return (
    <motion.svg
      className="h-16 w-16"
      viewBox="0 0 100 100"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="#22c55e"
        strokeLinecap="round"
        strokeWidth="7"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M30 50 L45 65 L70 35"
        stroke="#22c55e"
        strokeWidth="7"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </motion.svg>
  );
};

export default SuccessTip;
