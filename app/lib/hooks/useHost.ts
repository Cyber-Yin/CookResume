import { useEffect, useState } from "react";

export const useHost = () => {
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.origin);
  }, []);

  return {
    host,
  };
};
