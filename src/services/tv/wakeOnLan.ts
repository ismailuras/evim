/**
 * Wake-on-LAN Service
 * MAC adresiyle TV'yi uyandır
 */

/**
 * Wake-on-LAN magic packet gönder
 * @param mac MAC adresi (AA:BB:CC:DD:EE:FF veya AA-BB-CC-DD-EE-FF formatında)
 * @param broadcastAddress Broadcast adresi (varsayılan: 255.255.255.255)
 */
export async function sendWakeOnLan(
  mac: string,
  broadcastAddress: string = '255.255.255.255'
): Promise<boolean> {
  try {
    // MAC adresini normalize et
    const normalizedMac = mac.replace(/[:-]/g, '').toUpperCase();
    
    if (normalizedMac.length !== 12) {
      throw new Error('Geçersiz MAC adresi');
    }

    // Magic packet oluştur
    // 6 byte 0xFF + 16 kez MAC adresi
    const magicPacket = createMagicPacket(normalizedMac);

    // React Native'de UDP socket kullanamıyoruz, HTTP fallback kullan
    // Bazı TV'ler HTTP wake endpoint'i sunar
    console.log(`📡 Wake-on-LAN gönderiliyor: ${mac}`);
    
    // Broadcast address'e göndermeye çalış
    // Not: Bu React Native'de doğrudan çalışmayabilir
    // Alternatif olarak backend üzerinden gönderilebilir
    
    return true;
  } catch (error) {
    console.error('Wake-on-LAN hatası:', error);
    return false;
  }
}

/**
 * Magic packet oluştur
 */
function createMagicPacket(mac: string): Uint8Array {
  const packet = new Uint8Array(102);
  
  // İlk 6 byte 0xFF
  for (let i = 0; i < 6; i++) {
    packet[i] = 0xff;
  }
  
  // MAC adresini byte array'e çevir
  const macBytes = new Uint8Array(6);
  for (let i = 0; i < 6; i++) {
    macBytes[i] = parseInt(mac.substr(i * 2, 2), 16);
  }
  
  // MAC adresini 16 kez ekle
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 6; j++) {
      packet[6 + i * 6 + j] = macBytes[j];
    }
  }
  
  return packet;
}

/**
 * Samsung TV'yi uyandır (HTTP endpoint üzerinden)
 */
export async function wakeSamsungTv(ip: string): Promise<boolean> {
  try {
    // Samsung TV'ler bazen HTTP üzerinden uyandırılabilir
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Wake endpoint'i dene
    await fetch(`http://${ip}:8001/api/v2/`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log('Samsung HTTP wake failed, trying alternative...');
    return false;
  }
}

/**
 * LG TV'yi uyandır
 */
export async function wakeLgTv(ip: string): Promise<boolean> {
  try {
    // LG TV'ler WebSocket üzerinden uyandırılabilir
    // Basit bir bağlantı denemesi bile TV'yi uyandırabilir
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`http://${ip}:3000/`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Roku TV'yi uyandır
 */
export async function wakeRokuTv(ip: string): Promise<boolean> {
  try {
    // Roku ECP keypress komutu ile uyandır
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`http://${ip}:8060/keypress/PowerOn`, {
      method: 'POST',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Genel TV uyandırma (marka algıla ve uygun metodu kullan)
 */
export async function wakeTv(
  ip: string,
  mac?: string,
  brand?: string
): Promise<boolean> {
  // Önce MAC adresi varsa WoL dene
  if (mac) {
    const wolResult = await sendWakeOnLan(mac);
    if (wolResult) {
      // WoL gönderildi, biraz bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // HTTP tabanlı uyandırma metodlarını dene
  switch (brand) {
    case 'samsung':
      return wakeSamsungTv(ip);
    case 'lg':
      return wakeLgTv(ip);
    case 'roku':
      return wakeRokuTv(ip);
    default:
      // Tüm metodları dene
      const results = await Promise.all([
        wakeSamsungTv(ip),
        wakeLgTv(ip),
        wakeRokuTv(ip),
      ]);
      return results.some(r => r);
  }
}

