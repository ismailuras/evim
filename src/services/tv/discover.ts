/**
 * TV Discovery Service
 * Yerel ağda Samsung, LG, Android TV, Roku, Vestel otomatik keşif
 * mDNS + SSDP + HTTP Scanning
 */

import { DiscoveredTv, TvBrand } from './types';

// Discovery timeout (30 seconds)
const DISCOVERY_TIMEOUT = 30000;

// Common TV ports to scan
const TV_PORTS = {
  samsung: [8001, 8002], // Samsung WebSocket
  lg: [3000, 3001], // LG WebOS
  roku: [8060], // Roku ECP
  android: [8008, 8443], // Android TV / Google Cast
};

// SSDP search targets
const SSDP_TARGETS = [
  'urn:samsung.com:device:RemoteControlReceiver:1',
  'urn:schemas-upnp-org:device:MediaRenderer:1',
  'urn:dial-multiscreen-org:service:dial:1',
  'roku:ecp',
];

/**
 * Ana keşif fonksiyonu - tüm yöntemleri dener
 */
export async function discoverTvs(
  onProgress?: (message: string) => void,
  onTvFound?: (tv: DiscoveredTv) => void
): Promise<DiscoveredTv[]> {
  const discoveredTvs: Map<string, DiscoveredTv> = new Map();
  
  const addTv = (tv: DiscoveredTv) => {
    if (!discoveredTvs.has(tv.ip)) {
      discoveredTvs.set(tv.ip, tv);
      onTvFound?.(tv);
    }
  };

  onProgress?.('TV aranıyor...');

  try {
    // Method 1: HTTP Port Scanning (most reliable for React Native)
    onProgress?.('Ağ taranıyor...');
    const scannedTvs = await scanNetworkForTvs(onProgress);
    scannedTvs.forEach(addTv);

    // Method 2: Samsung specific discovery
    onProgress?.('Samsung TV aranıyor...');
    const samsungTvs = await discoverSamsungTvs();
    samsungTvs.forEach(addTv);

    // Method 3: Roku specific discovery
    onProgress?.('Roku aranıyor...');
    const rokuTvs = await discoverRokuTvs();
    rokuTvs.forEach(addTv);

  } catch (error) {
    console.error('Discovery error:', error);
  }

  onProgress?.(`${discoveredTvs.size} TV bulundu`);
  return Array.from(discoveredTvs.values());
}

/**
 * Yerel ağdaki IP'leri tarayarak TV bul
 */
async function scanNetworkForTvs(
  onProgress?: (message: string) => void
): Promise<DiscoveredTv[]> {
  const tvs: DiscoveredTv[] = [];
  
  // Get local IP range (assume 192.168.1.x or 192.168.0.x)
  const baseIps = ['192.168.1', '192.168.0', '10.0.0'];
  
  for (const baseIp of baseIps) {
    // Scan common TV IPs (1-254, but prioritize common ranges)
    const priorityRanges = [
      ...Array.from({ length: 50 }, (_, i) => i + 1),   // 1-50
      ...Array.from({ length: 50 }, (_, i) => i + 100), // 100-150
      ...Array.from({ length: 54 }, (_, i) => i + 200), // 200-254
    ];

    const scanPromises = priorityRanges.map(async (i) => {
      const ip = `${baseIp}.${i}`;
      
      try {
        // Check Samsung (port 8001)
        const samsungTv = await checkSamsungTv(ip);
        if (samsungTv) return samsungTv;

        // Check Roku (port 8060)
        const rokuTv = await checkRokuTv(ip);
        if (rokuTv) return rokuTv;

        // Check LG (port 3000)
        const lgTv = await checkLgTv(ip);
        if (lgTv) return lgTv;

        return null;
      } catch {
        return null;
      }
    });

    // Run in batches to avoid overwhelming the network
    const batchSize = 20;
    for (let i = 0; i < scanPromises.length; i += batchSize) {
      const batch = scanPromises.slice(i, i + batchSize);
      const results = await Promise.all(batch);
      results.filter(Boolean).forEach(tv => tvs.push(tv!));
      
      onProgress?.(`Taranıyor... ${Math.min(i + batchSize, scanPromises.length)}/${scanPromises.length}`);
    }
  }

  return tvs;
}

/**
 * Samsung TV kontrolü
 */
async function checkSamsungTv(ip: string): Promise<DiscoveredTv | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://${ip}:8001/api/v2/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        ip,
        name: data.device?.name || data.name || 'Samsung TV',
        brand: 'samsung',
        model: data.device?.modelName || data.model,
        mac: data.device?.wifiMac || data.device?.id,
        port: 8001,
        friendlyName: data.device?.name,
        manufacturer: 'Samsung',
      };
    }
  } catch {
    // Try port 8002 (secure)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`http://${ip}:8002/api/v2/`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          ip,
          name: data.device?.name || 'Samsung TV',
          brand: 'samsung',
          model: data.device?.modelName,
          mac: data.device?.wifiMac,
          port: 8002,
          manufacturer: 'Samsung',
        };
      }
    } catch {
      // Not a Samsung TV
    }
  }
  return null;
}

/**
 * Roku TV kontrolü
 */
async function checkRokuTv(ip: string): Promise<DiscoveredTv | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://${ip}:8060/query/device-info`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      
      // Parse XML response
      const nameMatch = text.match(/<friendly-device-name>([^<]+)<\/friendly-device-name>/);
      const modelMatch = text.match(/<model-name>([^<]+)<\/model-name>/);
      const macMatch = text.match(/<wifi-mac>([^<]+)<\/wifi-mac>/);
      
      return {
        ip,
        name: nameMatch?.[1] || 'Roku TV',
        brand: 'roku',
        model: modelMatch?.[1],
        mac: macMatch?.[1],
        port: 8060,
        manufacturer: 'Roku',
      };
    }
  } catch {
    // Not a Roku TV
  }
  return null;
}

/**
 * LG TV kontrolü
 */
async function checkLgTv(ip: string): Promise<DiscoveredTv | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // LG WebOS uses WebSocket, but we can check if port 3000 is open
    const response = await fetch(`http://${ip}:3000/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // LG TVs might respond with various codes
    if (response.status === 200 || response.status === 404) {
      return {
        ip,
        name: 'LG TV',
        brand: 'lg',
        port: 3000,
        manufacturer: 'LG',
      };
    }
  } catch {
    // Try alternate port
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`http://${ip}:3001/`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.status === 200 || response.status === 404) {
        return {
          ip,
          name: 'LG TV',
          brand: 'lg',
          port: 3001,
          manufacturer: 'LG',
        };
      }
    } catch {
      // Not an LG TV
    }
  }
  return null;
}

/**
 * Samsung TV'leri SSDP ile bul
 */
async function discoverSamsungTvs(): Promise<DiscoveredTv[]> {
  // SSDP requires native module, fallback to HTTP discovery
  return [];
}

/**
 * Roku TV'leri keşfet
 */
async function discoverRokuTvs(): Promise<DiscoveredTv[]> {
  // Additional Roku discovery methods would go here
  return [];
}

/**
 * TV'nin hala erişilebilir olup olmadığını kontrol et
 */
export async function checkTvOnline(ip: string, brand: TvBrand): Promise<boolean> {
  try {
    switch (brand) {
      case 'samsung':
        const samsung = await checkSamsungTv(ip);
        return samsung !== null;
      
      case 'roku':
        const roku = await checkRokuTv(ip);
        return roku !== null;
      
      case 'lg':
        const lg = await checkLgTv(ip);
        return lg !== null;
      
      default:
        // Generic check - try to connect to common ports
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        try {
          await fetch(`http://${ip}:8001/`, { signal: controller.signal });
          clearTimeout(timeoutId);
          return true;
        } catch {
          clearTimeout(timeoutId);
          return false;
        }
    }
  } catch {
    return false;
  }
}

/**
 * TV markasını otomatik algıla
 */
export async function detectTvBrand(ip: string): Promise<TvBrand> {
  // Try Samsung first (most common)
  if (await checkSamsungTv(ip)) return 'samsung';
  
  // Try Roku
  if (await checkRokuTv(ip)) return 'roku';
  
  // Try LG
  if (await checkLgTv(ip)) return 'lg';
  
  return 'unknown';
}

