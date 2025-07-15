import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

interface NetworkInformation extends EventTarget {
  effectiveType: ConnectionType;
  rtt: number;
  downlink: number;
  saveData: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface Navigator {
  connection?: NetworkInformation;
}

interface Connection {
    effectiveType?: ConnectionType;
    rtt?: number;
    downlink?: number;
    saveData?: boolean;
}

const NetworkStatus = () => {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
        setIsOnline(navigator.onLine);
    };

    const updateConnectionDetails = () => {
        const conn = (navigator as Navigator).connection;
        if (conn) {
            setConnection({
                effectiveType: conn.effectiveType,
                rtt: conn.rtt,
                downlink: conn.downlink,
                saveData: conn.saveData,
            });
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    updateConnectionDetails();
    
    const conn = (navigator as Navigator).connection;
    if (conn) {
        conn.addEventListener('change', updateConnectionDetails);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (conn) {
        conn.removeEventListener('change', updateConnectionDetails);
      }
    };
  }, []);

  if (!isOnline) {
    return (
        <div className="flex items-center gap-2 p-2 bg-red-800 bg-opacity-50 rounded-lg text-sm text-red-300">
            <WifiOff size={16} />
            Offline
        </div>
    );
  }

  if (!connection) {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-700 bg-opacity-50 rounded-lg text-sm text-gray-400">
            <Wifi size={16} />
            <span>Connection: Unknown</span>
        </div>
    );
  }

  const getStatus = () => {
      switch (connection.effectiveType) {
          case '4g':
              return { text: 'Fast', color: 'text-green-400', Icon: Wifi };
          case '3g':
              return { text: 'Moderate', color: 'text-yellow-400', Icon: Wifi };
          case '2g':
          case 'slow-2g':
              return { text: 'Slow', color: 'text-orange-400', Icon: Wifi };
          default:
              return { text: 'Unknown', color: 'text-gray-400', Icon: Wifi };
      }
  }

  const { text, color, Icon } = getStatus();

  return (
    <div className={`flex items-center gap-2 p-2 bg-gray-700 bg-opacity-50 rounded-lg text-sm ${color}`}>
      <Icon size={16} />
      <span>Connection: {text}</span>
    </div>
  );
};

export default NetworkStatus;