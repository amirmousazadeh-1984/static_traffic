// src/components/LogoutConfirmModal.tsx

import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { translations, type Language } from '../locales';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: Language;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm, language }: LogoutConfirmModalProps) {
  const t = translations[language] || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t.logoutConfirmTitle || (language === 'fa' ? 'خروج از حساب' : 'Logout Confirmation')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.logoutConfirmMessage || (language === 'fa' ? 'مطمئنی می‌خوای از حساب خارج شی؟' : 'Are you sure you want to logout?')}
          </p>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-center">
          <Button variant="outline" onClick={onClose} className=" dark:bg-slate-700">
            {t.cancel || 'لغو'}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className=" dark:bg-slate-700">
            {t.confirmLogout || 'بله، خارج شو'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}