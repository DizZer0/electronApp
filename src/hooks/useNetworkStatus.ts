import { Network } from "@capacitor/network";
import { useState, useEffect } from "react";

export const useNetworkStatus = (): {
  isOnline: boolean;
} => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    Network.getStatus().then(({ connected }) => {
      handleNetworkChange(connected);
    });
    Network.addListener("networkStatusChange", ({ connected }) => {
      handleNetworkChange(connected);
    });

    const handleNetworkChange = (isOnline: boolean) => {
      setIsOnline(isOnline);
    };
  }, []);

  return { isOnline };
};
