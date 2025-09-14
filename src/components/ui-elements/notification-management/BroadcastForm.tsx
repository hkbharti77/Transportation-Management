'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, BroadcastNotification } from '@/services/notificationService';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/input/TextArea';

interface BroadcastFormProps {
  broadcast?: BroadcastNotification | null;
  onSave: (broadcast: BroadcastNotification) => void;
  onCancel: () => void;
  isLoading?: boolean;
  currentUserId: number;
}

export default function BroadcastForm({ 
  broadcast = null, 
  onSave, 
  onCancel,
  isLoading = false,
  currentUserId
}: BroadcastFormProps) {
  const [title, setTitle] = useState(broadcast?.title || '');
  const [message, setMessage] = useState(broadcast?.message || '');
  const [notificationType, setNotificationType] = useState<BroadcastNotification['notification_type']>(broadcast?.notification_type || 'sms');
  const [targetAudience, setTargetAudience] = useState(broadcast?.target_audience || 'all_active_users');
  const [scheduledAt, setScheduledAt] = useState<string>(broadcast?.scheduled_at || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (broadcast) {
      setTitle(broadcast.title || '');
      setMessage(broadcast.message || '');
      setNotificationType(broadcast.notification_type || 'sms');
      setTargetAudience(broadcast.target_audience || 'all_active_users');
      setScheduledAt(broadcast.scheduled_at || '');
    }
  }, [broadcast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const broadcastData = {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType,
        target_audience: targetAudience,
        scheduled_at: scheduledAt || undefined,
        created_by: currentUserId
      };

      // Validate required fields
      if (!broadcastData.title) {
        setError('Title is required');
        return;
      }

      if (!broadcastData.message) {
        setError('Message is required');
        return;
      }

      let result: BroadcastNotification;
      if (broadcast && broadcast.broadcast_id) {
        // Update existing broadcast
        result = await notificationService.updateBroadcastNotification(broadcast.broadcast_id, broadcastData);
      } else {
        // Create new broadcast
        result = await notificationService.createBroadcastNotification(broadcastData, currentUserId);
      }

      onSave(result);
    } catch (err) {
      console.error('Failed to save broadcast:', err);
      setError(err instanceof Error ? err.message : 'Failed to save broadcast');
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
              placeholder="e.g., Flash Sale Alert"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(value) => setNotificationType(value as BroadcastNotification['notification_type'])}
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">
              Target Audience *
            </Label>
            <Select
              options={[
                { value: 'all_active_users', label: 'All Active Users' },
                { value: 'all_drivers', label: 'All Drivers' },
                { value: 'all_customers', label: 'All Customers' },
                { value: 'all_transporters', label: 'All Transporters' }
              ]}
              value={targetAudience}
              onChange={(value) => setTargetAudience(value)}
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
            placeholder="e.g., Hi user_name, enjoy 20% off on all bookings made today! Use code FLASH20 at checkout."
            value={message}
            onChange={(value) => setMessage(value)}
          />
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
          <Button
            type="submit"
          >
            {broadcast?.broadcast_id ? 'Update Broadcast' : 'Create Broadcast'}
          </Button>
        </div>
      </form>
    </div>
  );
}