'use client';

import { Host, Service } from '@/types/infrastructure';
import { launchService, generateServiceUrl } from '@/lib/urls';

interface ServicePopoverProps {
  host: Host;
  onClose: () => void;
}

export function ServicePopover({ host, onClose }: ServicePopoverProps) {
  const handleServiceClick = (service: Service) => {
    launchService(host, service);
  };

  return (
    <div
      className="absolute left-full top-0 ml-2 z-50 bg-white dark:bg-black border-2 border-black dark:border-white min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b-2 border-black dark:border-white px-3 py-2 flex justify-between items-center">
        <span className="font-bold text-sm text-black dark:text-white">Services</span>
        <button
          onClick={onClose}
          className="text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {host.services.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No services</div>
      ) : (
        <ul>
          {host.services.map((service) => (
            <li key={service.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <button
                onClick={() => handleServiceClick(service)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-sm text-black dark:text-white">{service.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  :{service.port} ({service.protocol})
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {generateServiceUrl(host, service)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
