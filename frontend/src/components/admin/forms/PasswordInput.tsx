"use client";

import React, { useState } from 'react';

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showStrength?: boolean;
  onStrengthChange?: (strength: 'weak' | 'medium' | 'strong' | 'very-strong') => void;
};

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export default function PasswordInput({
  value,
  onChange,
  label,
  required = false,
  placeholder,
  disabled = false,
  showStrength = true,
  onStrengthChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return 'weak';
    
    let strength = 0;
    
    // 長度檢查
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // 包含小寫字母
    if (/[a-z]/.test(password)) strength += 1;
    
    // 包含大寫字母
    if (/[A-Z]/.test(password)) strength += 1;
    
    // 包含數字
    if (/[0-9]/.test(password)) strength += 1;
    
    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    if (strength <= 4) return 'strong';
    return 'very-strong';
  };

  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak':
        return '密碼太簡單';
      case 'medium':
        return '密碼強度中等';
      case 'strong':
        return '密碼強度良好';
      case 'very-strong':
        return '密碼強度優秀';
    }
  };

  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'strong':
        return 'text-yellow-600';
      case 'very-strong':
        return 'text-green-600';
    }
  };

  const getStrengthRequirements = (password: string): string[] => {
    const requirements: string[] = [];
    
    if (password.length < 8) {
      requirements.push('至少需要 8 個字元');
    }
    if (!/[a-z]/.test(password)) {
      requirements.push('至少需要一個小寫字母');
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push('至少需要一個大寫字母');
    }
    if (!/[0-9]/.test(password)) {
      requirements.push('至少需要一個數字');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      requirements.push('至少需要一個特殊字符（如 !@#$%^&*）');
    }
    
    return requirements;
  };

  const strength = calculateStrength(value);
  const requirements = getStrengthRequirements(value);

  React.useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(strength);
    }
  }, [strength, onStrengthChange]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          minLength={8}
          className="w-full border rounded px-3 py-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${getStrengthColor(strength)}`}>
              {getStrengthText(strength)}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength === 'weak' ? 'bg-red-500 w-1/4' :
                  strength === 'medium' ? 'bg-orange-500 w-2/4' :
                  strength === 'strong' ? 'bg-yellow-500 w-3/4' :
                  'bg-green-500 w-full'
                }`}
              />
            </div>
          </div>
          
          {requirements.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-0.5 ml-4 list-disc">
              {requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          )}
          
          {requirements.length === 0 && (
            <p className="text-xs text-green-600">✓ 密碼符合所有要求</p>
          )}
        </div>
      )}
      
      {!value && (
        <p className="text-xs text-gray-500 mt-1">至少8個字元，建議包含大小寫字母、數字和特殊字符</p>
      )}
    </div>
  );
}

