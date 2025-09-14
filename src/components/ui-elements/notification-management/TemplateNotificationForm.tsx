'use client';

import React, { useState } from 'react';
import { notificationService, TemplateNotificationRequest, TemplateNotificationResponse } from '@/services/notificationService';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/input/TextArea';

interface TemplateNotificationFormProps {
  onSend: (result: TemplateNotificationResponse) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TemplateNotificationForm({ 
  onSend, 
  onCancel,
  isLoading = false
}: TemplateNotificationFormProps) {
  const [userIds, setUserIds] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'sms' | 'email' | 'push'>('sms');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [variableInputs, setVariableInputs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [metadataInputs, setMetadataInputs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [error, setError] = useState<string | null>(null);

  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newInputs = [...variableInputs];
    newInputs[index][field] = value;
    setVariableInputs(newInputs);
  };

  const addVariableField = () => {
    setVariableInputs([...variableInputs, { key: '', value: '' }]);
  };

  const removeVariableField = (index: number) => {
    const newInputs = [...variableInputs];
    newInputs.splice(index, 1);
    setVariableInputs(newInputs);
  };

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
      // Parse user IDs
      const userIdArray = userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (userIdArray.length === 0) {
        setError('At least one valid user ID is required');
        return;
      }

      // Convert variable inputs to object
      const variablesObj: Record<string, unknown> = {};
      variableInputs.forEach(({ key, value }) => {
        if (key.trim() !== '') {
          variablesObj[key.trim()] = value.trim();
        }
      });

      // Convert metadata inputs to object
      const metadataObj: Record<string, unknown> = {};
      metadataInputs.forEach(({ key, value }) => {
        if (key.trim() !== '') {
          metadataObj[key.trim()] = value.trim();
        }
      });

      const requestData: TemplateNotificationRequest = {
        user_ids: userIdArray,
        template_name: templateName,
        title: title || undefined,
        message: message || undefined,
        notification_type: notificationType,
        category: category || undefined,
        priority: priority,
        scheduled_at: scheduledAt || undefined,
        template_variables: variablesObj,
        metadata: metadataObj
      };

      // Validate required fields
      if (!requestData.template_name) {
        setError('Template name is required');
        return;
      }

      if (!requestData.notification_type) {
        setError('Notification type is required');
        return;
      }

      const result = await notificationService.sendTemplateNotifications(requestData);
      onSend(result);
    } catch (err) {
      console.error('Failed to send template notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to send template notifications');
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
          <div className="md:col-span-2">
            <Label htmlFor="userIds">
              User IDs *
            </Label>
            <Input
              id="userIds"
              type="text"
              placeholder="e.g., 1, 3, 5 (comma separated)"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter user IDs separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="templateName">
              Template Name *
            </Label>
            <Input
              id="templateName"
              type="text"
              placeholder="e.g., Ride Booking Confirmation"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
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
              onChange={(value) => setNotificationType(value as 'sms' | 'email' | 'push')}
            />
          </div>

          <div>
            <Label htmlFor="category">
              Category
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
            <Label htmlFor="priority">
              Priority
            </Label>
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' }
              ]}
              value={priority}
              onChange={(value) => setPriority(value as 'low' | 'normal' | 'high')}
            />
          </div>

          <div className="md:col-span-2">
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
          <Label htmlFor="title">
            Title (Optional - overrides template)
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Ride Confirmed"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <Label htmlFor="message">
            Message (Optional - overrides template)
          </Label>
          <Textarea
            rows={3}
            placeholder="e.g., Hi {{user_name}}, your booking {{booking_id}} is confirmed."
            value={message}
            onChange={(value) => setMessage(value)}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Label>Template Variables</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariableField}
            >
              Add Variable
            </Button>
          </div>
          
          <div className="mt-3 space-y-3">
            {variableInputs.map((variable, index) => (
              <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Variable name"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => removeVariableField(index)}
                    disabled={variableInputs.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
            Send Notifications
          </Button>
        </div>
      </form>
    </div>
  );
}