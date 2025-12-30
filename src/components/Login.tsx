// src/components/Login.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Camera } from 'lucide-react';
import { translations, type Language } from '../locales';

interface LoginProps {
  onLogin: () => void;
  language: Language;
}

export function Login({ onLogin, language }: LoginProps) {
  const t = translations[language] ; 
    const isRTL = language === 'fa';
    
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

 const handleLogin = () => {
  const savedUsername = localStorage.getItem('appUsername') || 'admin';
  const savedPassword = localStorage.getItem('appPassword') || 'admin';

  if (username.trim() === savedUsername && password.trim() === savedPassword) {
    onLogin();
  } else {
    setError(t.loginError || 'نام کاربری یا رمز عبور اشتباه است');
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-500 dark:bg-slate-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
             {t.loginTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {t.loginSubtitle}            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                              {t.usernameLabel}              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.interusername}
                className="mt-2 bg-white dark:bg-slate-700"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
        {t.passwordLabel }
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.enterpassword}
                className="mt-2 bg-white dark:bg-slate-700 mb-6"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <Button onClick={handleLogin} className="w-full mt-6 hover:bg-slate-600 bg-slate-500 dark:bg-slate-400" size="lg">
{t.loginButton }            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
}