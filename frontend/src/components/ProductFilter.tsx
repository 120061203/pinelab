/**
 * 商品篩選元件
 */
'use client';

import { useState } from 'react';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';
import { ProductListParams } from '@/types/product';

interface ProductFilterProps {
  categories: Category[];
  tags: Tag[];
  onFilterChange: (filters: ProductListParams) => void;
  onSearch: (query: string) => void;
}

export default function ProductFilter({
  categories,
  tags,
  onFilterChange,
  onSearch,
}: ProductFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('sort_order');

  const handleApplyFilters = () => {
    const filters: ProductListParams = {
      sort: sortBy as any,
    };
    
    if (selectedCategory) {
      filters.category = selectedCategory;
    }
    
    if (selectedTags.length > 0) {
      filters.tags = selectedTags;
    }
    
    if (minPrice) {
      filters.min_price = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      filters.max_price = parseFloat(maxPrice);
    }
    
    onFilterChange(filters);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTags([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('sort_order');
    onFilterChange({ sort: 'sort_order' });
    onSearch('');
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">篩選商品</h2>
      
      {/* 搜尋 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">搜尋商品</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入關鍵字..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            搜尋
          </button>
        </div>
      </div>
      
      {/* 分類 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">分類</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 標籤 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">標籤</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 價格區間 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">價格區間</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="最低價格"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="self-center">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="最高價格"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* 排序 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">排序</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="sort_order">預設排序</option>
          <option value="updated_at">最新更新</option>
          <option value="price">價格由低到高</option>
          <option value="-price">價格由高到低</option>
        </select>
      </div>
      
      {/* 操作按鈕 */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          套用篩選
        </button>
        <button
          onClick={handleClearFilters}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          清除
        </button>
      </div>
    </div>
  );
}

