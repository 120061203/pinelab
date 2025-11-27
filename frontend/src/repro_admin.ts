
// Mock types
interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    code?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

interface News {
    id: number;
    title: string;
    slug: string;
    content: string;
    publish_date: string;
    images?: any[];
    status?: 'draft' | 'published';
}

// Mock adminGetNewsItem (simulating admin-api.ts)
async function adminGetNewsItem(id: number): Promise<ApiResponse<News>> {
    // Simulate API call
    const response = await fetch(`http://localhost:8000/api/admin/news/${id}/`);

    if (!response) return undefined as any;

    const data = await response.json();
    return data;
}

// The function to test - SIMULATING THE LOAD FUNCTION IN ADMIN PAGE
async function load(id: string) {
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
        console.log('Invalid news ID');
        return;
    }

    try {
        const res: any = await adminGetNewsItem(newsId);
        console.log('Load news response:', res);

        // 檢查響應格式 - 更嚴格的檢查
        if (!res) {
            console.error('Response is undefined');
            console.log('Toast: 載入失敗：伺服器無回應');
            return;
        }

        // 檢查是否有 status 欄位
        if (!res.status) {
            console.error('Response missing status field:', res);
            console.log('Toast: 載入失敗：響應格式錯誤（缺少 status）');
            return;
        }

        // 檢查是否有 data 欄位
        if (res.status === 'success') {
            if (!res.data) {
                console.error('Response missing data field:', res);
                console.log('Toast: 載入失敗：響應格式錯誤（缺少 data）');
                return;
            }

            if (typeof res.data !== 'object') {
                console.error('Response data is not an object:', res.data);
                console.log('Toast: 載入失敗：數據格式錯誤');
                return;
            }

            // 安全地設置表單數據
            console.log('Success! Data loaded:', {
                title: res.data.title || '',
                slug: res.data.slug || '',
                content: res.data.content || '',
                publish_date: res.data.publish_date || new Date().toISOString().split('T')[0],
                status: res.data.status || 'draft',
            });
        } else {
            console.error('Invalid response status:', res);
            console.log('Toast:', res?.message || res?.detail || '載入失敗：無法取得消息資料');
        }
    } catch (e: any) {
        console.error('Load news error:', e);
        // 安全地獲取錯誤訊息
        let errorMessage = '載入失敗';
        if (e?.message) {
            errorMessage = e.message;
        } else if (e?.response?.data?.message) {
            errorMessage = e.response.data.message;
        } else if (e?.response?.data?.detail) {
            errorMessage = e.response.data.detail;
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        console.log('Toast:', errorMessage);
    }
}

// Mock fetch
global.fetch = async (url: any, options: any) => {
    console.log('Fetching:', url);
    return {
        ok: true,
        headers: {
            get: () => 'application/json',
        },
        json: async () => ({
            status: 'success',
            data: {
                id: 1,
                title: 'Test News',
                slug: 'test-news',
                content: 'Test Content',
                publish_date: '2023-01-01',
                status: 'published'
            }
        }),
    } as any;
};

// Test 1: Success case
async function testSuccess() {
    console.log('--- Test 1: Success Case ---');
    await load('1');
}

// Test 2: Failure case - response is undefined
async function testFailure() {
    console.log('\n--- Test 2: Failure Case (response undefined) ---');

    global.fetch = async (url: any, options: any) => {
        return {
            json: async () => undefined
        } as any;
    };

    await load('1');
}

// Test 3: Failure case - response.data is undefined
async function testFailureData() {
    console.log('\n--- Test 3: Failure Case (response.data undefined) ---');

    global.fetch = async (url: any, options: any) => {
        return {
            ok: true,
            headers: { get: () => 'application/json' },
            json: async () => ({ status: 'success' }), // No data
        } as any;
    };

    await load('1');
}

async function run() {
    await testSuccess();
    await testFailure();
    await testFailureData();
}

run();
