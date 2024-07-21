import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const matchMedia = window.matchMedia("only screen and (max-width : 767px)");
    const callback = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    if (matchMedia.matches) {
      setIsMobile(true);
    }

    matchMedia.addEventListener("change", callback);

    return () => {
      matchMedia.removeEventListener("change", callback);
    };
  }, []);

  return {
    isMobile,
  };
};
