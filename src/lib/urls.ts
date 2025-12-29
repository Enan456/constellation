import type { Host, Service } from '@/types/infrastructure';

export function generateServiceUrl(host: Host, service: Service): string {
  const protocol = service.protocol === 'https' ? 'https' : 'http';
  // For standard HTTP port 80, omit the port from URL
  if (service.port === 80 && protocol === 'http') {
    return `${protocol}://${host.ip}`;
  }
  if (service.port === 443 && protocol === 'https') {
    return `${protocol}://${host.ip}`;
  }
  return `${protocol}://${host.ip}:${service.port}`;
}

export function launchService(host: Host, service: Service): void {
  const url = generateServiceUrl(host, service);
  window.open(url, '_blank', 'noopener,noreferrer');
}
