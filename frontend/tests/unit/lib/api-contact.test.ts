/**
 * 聯絡表單 API 呼叫測試
 */
import { submitContact, apiClient } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('Contact API', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('submitContact', () => {
    it('應該成功提交聯絡表單', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            message: '聯絡表單已成功提交',
          },
        }),
      });

      const result = await submitContact({
        name: '測試使用者',
        email: 'test@example.com',
        message: '測試訊息',
        sign: 'mock_signature',
        timestamp: Date.now(),
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
      expect(result.status).toBe('success');
    });

    it('應該處理 API 錯誤', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          status: 'error',
          code: 'INVALID_SIGNATURE',
          message: '簽章驗證失敗',
        }),
      });

      await expect(
        submitContact({
          name: '測試使用者',
          email: 'test@example.com',
          message: '測試訊息',
          sign: 'invalid',
          timestamp: Date.now(),
        })
      ).rejects.toThrow();
    });
  });
});

