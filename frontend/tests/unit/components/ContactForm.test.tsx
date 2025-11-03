/**
 * ContactForm 元件測試
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '@/components/ContactForm';

jest.mock('@/lib/api', () => ({
  submitContact: jest.fn(),
}));

jest.mock('@/lib/signatures', () => ({
  signRequest: jest.fn(),
}));

describe('ContactForm', () => {
  beforeEach(() => {
    const { signRequest } = require('@/lib/signatures');
    signRequest.mockResolvedValue({
      name: '測試使用者',
      email: 'test@example.com',
      message: '測試訊息',
      sign: 'mock_signature',
      timestamp: Date.now(),
    });
  });

  it('應該顯示所有表單欄位', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/電子郵件/)).toBeInTheDocument();
    expect(screen.getByLabelText(/訊息內容/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /提交表單/ })).toBeInTheDocument();
  });

  it('應該驗證必填欄位', async () => {
    const { submitContact } = require('@/lib/api');
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /提交表單/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/姓名至少需要 2 個字元/)).toBeInTheDocument();
    });
    
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('應該驗證電子郵件格式', async () => {
    render(<ContactForm />);
    
    const emailInput = screen.getByLabelText(/電子郵件/);
    const submitButton = screen.getByRole('button', { name: /提交表單/ });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/請輸入有效的電子郵件格式/)).toBeInTheDocument();
    });
  });

  it('應該驗證訊息長度', async () => {
    render(<ContactForm />);
    
    const messageInput = screen.getByLabelText(/訊息內容/);
    const submitButton = screen.getByRole('button', { name: /提交表單/ });
    
    fireEvent.change(messageInput, { target: { value: '短' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/訊息至少需要 10 個字元/)).toBeInTheDocument();
    });
  });

  it('應該成功提交表單', async () => {
    const { submitContact } = require('@/lib/api');
    submitContact.mockResolvedValue({
      status: 'success',
      data: { message: '聯絡表單已成功提交' },
    });

    render(<ContactForm />);
    
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
    
    expect(submitContact).toHaveBeenCalled();
  });

  it('應該顯示錯誤訊息', async () => {
    const { submitContact } = require('@/lib/api');
    submitContact.mockRejectedValue(new Error('提交失敗'));

    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/姓名/);
    const emailInput = screen.getByLabelText(/電子郵件/);
    const messageInput = screen.getByLabelText(/訊息內容/);
    const submitButton = screen.getByRole('button', { name: /提交表單/ });
    
    fireEvent.change(nameInput, { target: { value: '測試使用者' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: '這是一個測試訊息，長度超過10個字元' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/提交時發生錯誤/)).toBeInTheDocument();
    });
  });
});

