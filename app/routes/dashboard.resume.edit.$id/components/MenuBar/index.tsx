import { useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { ScrollArea } from "@/components/ScrollArea";
import { cn } from "@/lib/utils";

import { DEFAULT_MENU_ITEMS } from "../../const";

const MenuBarVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.2,
    },
  }),
};

const MenuBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    return searchParams.get("tab") || "basic";
  }, [searchParams]);

  return (
    <ScrollArea className="h-full w-80 border-r bg-custom">
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-2 py-2"
      >
        {DEFAULT_MENU_ITEMS.map((item, index) => (
          <motion.div
            key={item.key}
            custom={index}
            variants={MenuBarVariants}
            className="px-2"
          >
            <div
              onClick={() => setSearchParams({ tab: item.key })}
              className={cn(
                "group flex cursor-pointer items-center space-x-2 rounded px-4 py-3 transition-colors",
                {
                  "bg-primary": tab === item.key,
                  "hover:bg-custom-hover": tab !== item.key,
                },
              )}
            >
              <div
                className={cn("font-semibold transition-colors", {
                  "text-white": tab === item.key,
                })}
              >
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </ScrollArea>
  );
};

export default MenuBar;
