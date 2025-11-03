/**
 * 聯絡頁面整合測試
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '@/app/contact/page';

jest.mock('@/lib/api', () => ({
  submitContact: jest.fn(),
}));

jest.mock('@/lib/signatures', () => ({
  signRequest: jest.fn(),
}));

describe('ContactPage Integration', () => {
  it('應該完整載入並顯示聯絡頁面', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('聯絡我們')).toBeInTheDocument();
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/電子郵件/)).toBeInTheDocument();
    expect(screen.getByLabelText(/訊息內容/)).toBeInTheDocument();
  });

  it('應該完整提交流程', async () => {
    const { signRequest } = require('@/lib/signatures');
    const { submitContact } = require('@/lib/api');
    
    signRequest.mockResolvedValue({
      name: '測試使用者',
      email: 'test@example.com',
      message: '這是一個測試訊息，長度超過10個字元',
      sign: 'mock_signature',
      timestamp: Date.now(),
    });
    
    submitContact.mockResolvedValue({
      status: 'success',
      data: { message: '聯絡表單已成功提交' },
    });

    render(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/姓名/);
    const emailInput = screen.getByLabelText(/電子郵件/);
    const messageInput = screen.getByLabelText(/訊息內容/);
    const submitButton = screen.getByRole('button', { name: /提交表單/ });
    
    fireEvent.change(nameInput, { target: { value: '測試使用者' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: '這是一個測試訊息，長度超過10個字元' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/聯絡表單已成功提交/)).toBeInTheDocument();
    });
    
    expect(signRequest).toHaveBeenCalled();
    expect(submitContact).toHaveBeenCalled();
  });
});

