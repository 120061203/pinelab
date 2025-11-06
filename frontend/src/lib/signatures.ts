/**
 * HMAC-SHA256 簽章生成工具
 */

const API_SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY || '';

/**
 * 生成 HMAC-SHA256 簽章
 * @param params 請求參數（不包含 sign）
 * @returns 簽章字串
 */
export async function generateSignature(
  params: Record<string, any>
): Promise<string> {
  // 使用 Web Crypto API 進行 HMAC-SHA256
  const encoder = new TextEncoder();
  
  // 1. 參數排序（ASCII 順序）
  const sortedParams = Object.entries(params)
    .filter(([key]) => key !== 'sign')
    .sort(([a], [b]) => a.localeCompare(b));
  
  // 2. 生成查詢字串
  const queryString = sortedParams
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // 3. 加上 secret key
  const fullString = `${queryString}&key=${API_SECRET_KEY}`;
  
  // 4. HMAC-SHA256
  const keyData = encoder.encode(API_SECRET_KEY);
  const messageData = encoder.encode(fullString);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  // 轉換為十六進位字串
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return signatureHex;
}

/**
 * 為請求參數生成簽章並添加 timestamp
 */
export async function signRequest(
  params: Record<string, any>
): Promise<Record<string, any>> {
  const timestamp = Date.now();
  const paramsWithTimestamp = {
    ...params,
    timestamp,
  };
  
  const sign = await generateSignature(paramsWithTimestamp);
  
  return {
    ...paramsWithTimestamp,
    sign,
  };
}

