'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/common/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Edit2, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from 'next-intl';

function ProfilePageContent() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError(t('phoneFormatError'));
      return;
    }

    setLoading(true);

    try {
      await apiClient.user.updateMe({
        name: formData.name.trim(),
        phone: formData.phone,
      });

      await checkAuth();
      setSuccess(t('updateSuccess'));
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(
        err instanceof Error ? err.message : t('errorUpdateFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('myInfo')}</h2>
              <p className="text-sm text-muted-foreground">{t('personalInfo')}</p>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                {t('updateProfile')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t('userId')}
                </Label>
                <Input
                  id="userId"
                  value={user?.userId || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  placeholder={t('namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={!isEditing || loading}
                  placeholder={t('phonePlaceholder')}
                  maxLength={13}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading ? t('saving') : tCommon('save')}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  {tCommon('cancel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}
