import React from 'react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

/**
 * Password strength indicator component
 */
const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className = '' }) => {
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/(?=.*[a-z])/.test(pwd)) score++;
    if (/(?=.*[A-Z])/.test(pwd)) score++;
    if (/(?=.*\d)/.test(pwd)) score++;
    if (/(?=.*[@$!%*?&])/.test(pwd)) score++;
    
    return score;
  };

  const strength = getPasswordStrength(password);
  
  const getStrengthInfo = (score: number) => {
    if (score === 0) return { label: '', color: '', width: '0%' };
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const { label, color, width } = getStrengthInfo(strength);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Password strength:</span>
        <span className={`text-xs font-medium ${
          strength <= 2 ? 'text-red-600' : 
          strength <= 4 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${color}`}
          style={{ width }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        <ul className="space-y-1">
          <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-1">{password.length >= 6 ? '✓' : '○'}</span>
            At least 6 characters
          </li>
          <li className={`flex items-center ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-1">{/(?=.*[a-z])/.test(password) ? '✓' : '○'}</span>
            One lowercase letter
          </li>
          <li className={`flex items-center ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-1">{/(?=.*[A-Z])/.test(password) ? '✓' : '○'}</span>
            One uppercase letter
          </li>
          <li className={`flex items-center ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-1">{/(?=.*\d)/.test(password) ? '✓' : '○'}</span>
            One number
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrength;
