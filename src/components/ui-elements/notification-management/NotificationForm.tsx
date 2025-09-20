'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/input/TextArea';

interface NotificationFormProps {
  notification?: Notification | null;
  onSave: (notification: Notification) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function NotificationForm({ 
  notification = null, 
  onSave, 
  onCancel,
  isLoading = false
}: NotificationFormProps) {
  const [title, setTitle] = useState(notification?.title || '');
  const [message, setMessage] = useState(notification?.message || '');
  const [notificationType, setNotificationType] = useState<Notification['notification_type']>(notification?.notification_type || 'sms');
  const [category, setCategory] = useState(notification?.category || '');
  const [priority, setPriority] = useState<Notification['priority']>(notification?.priority || 'normal');
  const [userId, setUserId] = useState<number>(notification?.user_id || 0);
  const [scheduledAt, setScheduledAt] = useState<string>(notification?.scheduled_at || '');
  // const [metadata, setMetadata] = useState<Record<string, unknown>>(notification?.metadata || {});
  const [metadataInputs, setMetadataInputs] = useState<Array<{ key: string; value: string }>>(
    notification?.metadata 
      ? Object.entries(notification.metadata).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: '', value: '' }]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      setTitle(notification.title || '');
      setMessage(notification.message || '');
      setNotificationType(notification.notification_type || 'sms');
      setCategory(notification.category || '');
      setPriority(notification.priority || 'normal');
      setUserId(notification.user_id || 0);
      setScheduledAt(notification.scheduled_at || '');
      // setMetadata(notification.metadata || {});
      setMetadataInputs(
        notification.metadata 
          ? Object.entries(notification.metadata).map(([key, value]) => ({ key, value: String(value) }))
          : [{ key: '', value: '' }]
      );
    }
  }, [notification]);

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newInputs = [...metadataInputs];
    newInputs[index][field] = value;
    setMetadataInputs(newInputs);
  };

  const addMetadataField = () => {
    setMetadataInputs([...metadataInputs, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    const newInputs = [...metadataInputs];
    newInputs.splice(index, 1);
    setMetadataInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Convert metadata inputs to object
      const metadataObj: Record<string, unknown> = {};
      metadataInputs.forEach(({ key, value }) => {
        if (key.trim() !== '') {
          metadataObj[key.trim()] = value.trim();
        }
      });

      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType,
        category: category.trim(),
        priority: priority,
        user_id: userId,
        scheduled_at: scheduledAt || undefined,
        metadata: metadataObj
      };

      // Validate required fields
      if (!notificationData.title) {
        setError('Title is required');
        return;
      }

      if (!notificationData.message) {
        setError('Message is required');
        return;
      }

      if (!notificationData.user_id) {
        setError('User ID is required');
        return;
      }

      let result: Notification;
      if (notification && notification.notification_id) {
        // Update existing notification
        result = await notificationService.updateNotification(notification.notification_id, notificationData);
      } else {
        // Create new notification
        result = await notificationService.createNotification(notificationData);
      }

      onSave(result);
    } catch (err) {
      console.error('Failed to save notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to save notification');
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-default dark:border-white/[0.05] dark:bg-white/[0.03]">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="title">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Ride Booking Confirmed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="category">
              Category *
            </Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., booking, trip, order"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notificationType">
              Notification Type *
            </Label>
            <Select
              options={[
                { value: 'sms', label: 'SMS' },
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Push Notification' }
              ]}
              value={notificationType}
              onChange={(value) => setNotificationType(value as Notification['notification_type'])}
            />
          </div>

          <div>
            <Label htmlFor="priority">
              Priority *
            </Label>
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' }
              ]}
              value={priority}
              onChange={(value) => setPriority(value as Notification['priority'])}
            />
          </div>

          <div>
            <Label htmlFor="userId">
              User ID *
            </Label>
            <Input
              id="userId"
              type="number"
              placeholder="e.g., 3"
              value={userId || ''}
              onChange={(e) => setUserId(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt">
              Scheduled At
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="message">
            Message *
          </Label>
          <Textarea
            rows={4}
            placeholder="e.g., Hello {{customer_name}}, your booking #{{booking_id}} has been confirmed."
            value={message}
            onChange={(value) => setMessage(value)}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Label>Metadata</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMetadataField}
            >
              Add Metadata
            </Button>
          </div>
          
          <div className="mt-3 space-y-3">
            {metadataInputs.map((meta, index) => (
              <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Key"
                    value={meta.key}
                    onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={meta.value}
                    onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => removeMetadataField(index)}
                    disabled={metadataInputs.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {metadataInputs.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No metadata defined.
            </p>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {notification?.notification_id && notification.status === 'pending' && !notification.sent_at && (
            <Button
              type="button"
              variant="primary"
              onClick={async () => {
                try {
                  await notificationService.sendNotification(notification.notification_id!);
                  // Reload the notification to update its status
                  const updatedNotification = await notificationService.getNotificationById(notification.notification_id!);
                  onSave(updatedNotification);
                } catch (err) {
                  console.error('Failed to send notification:', err);
                  setError(err instanceof Error ? err.message : 'Failed to send notification');
                }
              }}
            >
              Send Notification
            </Button>
          )}
          <Button
            type="submit"
          >
            {notification?.notification_id ? 'Update Notification' : 'Create Notification'}
          </Button>
        </div>
      </form>
    </div>
  );
}