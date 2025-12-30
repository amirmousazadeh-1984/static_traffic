// src/components/ChangeCredentialsModal.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'; // از shadcn/ui
import { translations, type Language } from '../locales';

interface ChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function ChangeCredentialsModal({ isOpen, onClose, language }: ChangeCredentialsModalProps) {
  const t = translations[language] || {};
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setError(t.emptyFields || 'نام کاربری و رمز عبور نمی‌توانند خالی باشند');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch || 'رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    // ذخیره در localStorage
    localStorage.setItem('appUsername', newUsername.trim());
    localStorage.setItem('appPassword', newPassword.trim());

    // موفقیت
    onClose();
    // می‌تونی toast اضافه کنی
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <DialogHeader className="pb-6">
          <DialogTitle>{t.changeCredentialsTitle || 'تغییر نام کاربری و رمز عبور'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="new-username">{t.newUsername || 'نام کاربری جدید'}</Label>
            <Input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="admin"
                             className="mt-2 bg-white dark:bg-slate-700"

            />
          </div>

          <div>
            <Label htmlFor="new-password">{t.newPassword || 'رمز عبور جدید'}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••"
                              className="mt-2 bg-white dark:bg-slate-700"

            />
          </div>

          <div>
            <Label htmlFor="confirm-password">{t.confirmPassword || 'تکرار رمز عبور'}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
                              className="mt-2 bg-white dark:bg-slate-700 "

            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center font-medium ">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className='mt-4 '>
          <Button variant="outline" onClick={onClose}>
            {t.cancel || 'انصراف'}
          </Button>
          <Button onClick={handleSave}  className="text-slate-100 dark:text-slate-900 hover:bg-slate-600 bg-slate-500 dark:bg-slate-400">
            {t.saveChanges || 'ذخیره تغییرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

