import { useSearchParams } from "@remix-run/react";
import { useMemo } from "react";

import { ScrollArea } from "@/components/ScrollArea";
import { cn } from "@/lib/utils";

import { DEFAULT_MENU_ITEMS } from "../../const";

const MobileMenuBar: React.FC<{
  onNavigate: (tab: string) => void;
}> = ({ onNavigate }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    return searchParams.get("tab") || "meta";
  }, [searchParams]);

  return (
    <ScrollArea className="h-[50vh] w-full">
      <div className="flex w-full">
        <div className="h-full grow space-y-2 py-2">
          {DEFAULT_MENU_ITEMS.map((item) => (
            <div
              key={item.key}
              className="px-2"
            >
              <div
                onClick={() => {
                  setSearchParams({ tab: item.key });
                  onNavigate(item.key);
                }}
                className={cn(
                  "flex cursor-pointer items-center space-x-2 rounded px-4 py-3 transition-colors",
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
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MobileMenuBar;
