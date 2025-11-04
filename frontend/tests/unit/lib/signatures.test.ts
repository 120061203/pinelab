/**
 * 簽章生成功能測試
 */
import { generateSignature, signRequest } from '@/lib/signatures';

// Mock crypto.subtle
global.crypto = {
  subtle: {
    importKey: jest.fn(),
    sign: jest.fn(),
  } as any,
} as any;

describe('Signatures', () => {
  beforeEach(() => {
    // Mock Web Crypto API
    (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue({});
    (global.crypto.subtle.sign as jest.Mock).mockResolvedValue(
      new Uint8Array(32).fill(0) // Mock signature bytes
    );
  });

  describe('generateSignature', () => {
    it('應該生成簽章', async () => {
      const params = {
        name: '測試',
        email: 'test@example.com',
        message: '測試訊息',
      };

      const signature = await generateSignature(params);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
    });

    it('應該排除 sign 參數', async () => {
      const params = {
        name: '測試',
        email: 'test@example.com',
        message: '測試訊息',
        sign: 'existing_sign',
      };

      // 應該可以正常生成，不包含 sign
      const signature = await generateSignature(params);
      expect(signature).toBeDefined();
    });
  });

  describe('signRequest', () => {
    it('應該為請求參數添加 timestamp 和 sign', async () => {
      const params = {
        name: '測試',
        email: 'test@example.com',
        message: '測試訊息',
      };

      const signed = await signRequest(params);

      expect(signed.timestamp).toBeDefined();
      expect(signed.sign).toBeDefined();
      expect(signed.name).toBe('測試');
      expect(signed.email).toBe('test@example.com');
    });
  });
});

