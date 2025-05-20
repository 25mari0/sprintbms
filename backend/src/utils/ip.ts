import { Request } from 'express';

export const getClientIp = (req: Request): string => {
  let ip: string;

  // If behind proxy
  if (req.headers['x-forwarded-for']) {
    ip = (req.headers['x-forwarded-for'] as string).split(',')[0].trim();
  } else {
    // Direct connection
    ip = req.socket.remoteAddress || '0.0.0.0';
  }

  // Clean up IPv6-mapped IPv4 addresses
  // Convert ::ffff:192.0.2.128 to 192.0.2.128
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // For development/testing when we might get Docker IPs
  if (ip.startsWith('172.') || ip.startsWith('192.') || ip === '127.0.0.1') {
    // Use a default IP for testing within Docker
    ip = process.env.GEO_PLACEHOLDER_IP!;
  }

  return ip;
};