"""
聯絡表單管理 API 測試
"""
import pytest
from apps.contacts.models import Contact


@pytest.mark.django_db
class TestAdminContacts:
    """管理員聯絡表單管理 API 測試"""
    
    def test_list_contacts(self, authenticated_client):
        """測試取得聯絡表單列表"""
        Contact.objects.create(
            name='使用者1',
            email='user1@example.com',
            message='訊息1，長度超過10個字元'
        )
        Contact.objects.create(
            name='使用者2',
            email='user2@example.com',
            message='訊息2，長度超過10個字元'
        )
        
        response = authenticated_client.get('/api/admin/contact/')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) >= 2
    
    def test_get_contact(self, authenticated_client):
        """測試取得單一聯絡表單"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='測試訊息，長度超過10個字元'
        )
        
        response = authenticated_client.get(f'/api/admin/contact/{contact.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['name'] == '測試使用者'
        assert data['data']['email'] == 'test@example.com'
    
    def test_mark_contact_read(self, authenticated_client):
        """測試標記聯絡表單為已讀"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='測試訊息，長度超過10個字元',
            is_read=False
        )
        
        response = authenticated_client.post(f'/api/admin/contact/{contact.id}/mark_read/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['is_read'] is True
        
        contact.refresh_from_db()
        assert contact.is_read is True
    
    def test_mark_contact_unread(self, authenticated_client):
        """測試標記聯絡表單為未讀"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='測試訊息，長度超過10個字元',
            is_read=True
        )
        
        response = authenticated_client.post(f'/api/admin/contact/{contact.id}/mark_unread/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['is_read'] is False
        
        contact.refresh_from_db()
        assert contact.is_read is False
    
    def test_get_unread_count(self, authenticated_client):
        """測試取得未讀聯絡表單數量"""
        Contact.objects.create(
            name='使用者1',
            email='user1@example.com',
            message='訊息1，長度超過10個字元',
            is_read=False
        )
        Contact.objects.create(
            name='使用者2',
            email='user2@example.com',
            message='訊息2，長度超過10個字元',
            is_read=True
        )
        
        response = authenticated_client.get('/api/admin/contact/unread_count/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['count'] == 1

