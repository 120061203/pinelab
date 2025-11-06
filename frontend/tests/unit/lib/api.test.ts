/**
 * API 客戶端測試
 */
import { getProducts, getProduct, getCategories, getTags, apiClient } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getProducts', () => {
    it('應該取得商品列表', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            count: 1,
            results: [
              {
                id: 1,
                name: '測試商品',
                price: '999',
              },
            ],
          },
        }),
      });

      const result = await getProducts();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/'),
        expect.any(Object)
      );
      expect(result.status).toBe('success');
    });

    it('應該支援篩選參數', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: { results: [] } }),
      });

      await getProducts({ category: 1, min_price: 100 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=1'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('min_price=100'),
        expect.any(Object)
      );
    });

    it('應該支援多標籤篩選', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: { results: [] } }),
      });

      await getProducts({ tags: [1, 2] });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('tags=1'),
        expect.any(Object)
      );
    });
  });

  describe('getProduct', () => {
    it('應該取得單一商品', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            id: 1,
            name: '測試商品',
            price: '999',
          },
        }),
      });

      const result = await getProduct(1);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1/'),
        expect.any(Object)
      );
      expect(result.status).toBe('success');
    });
  });

  describe('getCategories', () => {
    it('應該取得分類列表', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [
            { id: 1, name: '分類1' },
          ],
        }),
      });

      const result = await getCategories();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories/'),
        expect.any(Object)
      );
      expect(result.status).toBe('success');
    });
  });

  describe('getTags', () => {
    it('應該取得標籤列表', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [
            { id: 1, name: '標籤1' },
          ],
        }),
      });

      const result = await getTags();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tags/'),
        expect.any(Object)
      );
      expect(result.status).toBe('success');
    });
  });
});

