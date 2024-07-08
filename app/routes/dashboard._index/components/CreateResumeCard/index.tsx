import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";

const circleVariants = {
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.8 },
  },
  hidden: { opacity: 0, pathLength: 0 },
};

const plusVariants = {
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { delay: 0.8, duration: 0.5 },
  },
  hidden: { opacity: 0, pathLength: 0 },
};

const CreateResumeCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="aspect-image flex flex-col items-center justify-center space-y-4 rounded-lg border border-custom bg-white"
    >
      <div className="text-xl font-semibold text-custom-tertiary">新建简历</div>
      <motion.svg
        onClick={() => navigate("/dashboard/resume/new")}
        initial="hidden"
        animate="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="group h-16 w-16 cursor-pointer"
        viewBox="0 0 24 24"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          strokeWidth="1"
          strokeLinecap="round"
          variants={circleVariants}
          className="fill-white stroke-primary-light transition-colors group-hover:fill-primary group-hover:stroke-primary"
        />
        <motion.line
          x1="12"
          y1="8"
          x2="12"
          y2="16"
          strokeWidth="1"
          variants={plusVariants}
          className="stroke-primary-light transition-colors group-hover:stroke-white"
        />
        <motion.line
          x1="8"
          y1="12"
          x2="16"
          y2="12"
          strokeWidth="1"
          variants={plusVariants}
          className="stroke-primary-light transition-colors group-hover:stroke-white"
        />
      </motion.svg>
    </motion.div>
  );
};

export default CreateResumeCard;
