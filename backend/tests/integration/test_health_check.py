"""
健康檢查 API 測試
"""
import pytest


@pytest.mark.django_db
class TestHealthCheck:
    """健康檢查 API 測試"""
    
    def test_health_check_endpoint(self, api_client):
        """測試健康檢查端點"""
        response = api_client.get('/api/health/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert 'checks' in data
        assert 'database' in data['checks']
    
    def test_health_check_database_status(self, api_client):
        """測試資料庫狀態檢查"""
        response = api_client.get('/api/health/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['checks']['database'] == 'ok'

