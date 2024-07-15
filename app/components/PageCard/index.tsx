import { motion } from "framer-motion";

const PageCard: React.FC<{
  children: React.ReactNode;
  title: string;
}> = ({ children, title }) => {
  return (
    <div className="mx-auto flex h-screen min-h-screen w-full items-center sm:h-auto sm:w-[500px] sm:py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full w-full flex-col items-center justify-center space-y-12 bg-custom px-4 py-16 sm:h-auto sm:rounded-lg sm:border-t-4 sm:border-t-primary sm:shadow-lg"
      >
        <div className="flex w-full items-center justify-center">
          <img
            src="/icons/logo.svg"
            alt="logo"
            className="h-20 w-20"
          />
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </motion.div>
    </div>
  );
};

export default PageCard;
