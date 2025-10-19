'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, NotificationTemplate } from '@/services/notificationService';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import TextArea from '@/components/form/input/TextArea';

interface TemplateFormProps {
  template?: NotificationTemplate | null;
  onSave: (template: NotificationTemplate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TemplateForm({ 
  template = null, 
  onSave, 
  onCancel,
  isLoading = false
}: TemplateFormProps) {
  const [name, setName] = useState(template?.name || '');
  const [titleTemplate, setTitleTemplate] = useState(template?.title_template || '');
  const [messageTemplate, setMessageTemplate] = useState(template?.message_template || '');
  const [notificationType, setNotificationType] = useState<NotificationTemplate['notification_type']>(template?.notification_type || 'sms');
  const [category, setCategory] = useState(template?.category || '');
  const [isActive, setIsActive] = useState(template?.is_active ?? true);
  // const [variables, setVariables] = useState<Record<string, unknown>>(template?.variables || {});
  const [variableInputs, setVariableInputs] = useState<Array<{ key: string; value: string }>>(
    template?.variables 
      ? Object.entries(template.variables).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: '', value: '' }]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setTitleTemplate(template.title_template || '');
      setMessageTemplate(template.message_template || '');
      setNotificationType(template.notification_type || 'sms');
      setCategory(template.category || '');
      setIsActive(template.is_active ?? true);
      // setVariables(template.variables || {});
      setVariableInputs(
        template.variables 
          ? Object.entries(template.variables).map(([key, value]) => ({ key, value: String(value) }))
          : [{ key: '', value: '' }]
      );
    }
  }, [template]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Convert variable inputs to object
      const variablesObj: Record<string, unknown> = {};
      variableInputs.forEach(({ key, value }) => {
        if (key.trim() !== '') {
          variablesObj[key.trim()] = value.trim();
        }
      });

      const templateData = {
        name: name.trim(),
        title_template: titleTemplate.trim(),
        message_template: messageTemplate.trim(),
        notification_type: notificationType,
        category: category.trim(),
        is_active: isActive,
        variables: variablesObj
      };

      // Validate required fields
      if (!templateData.name) {
        setError('Template name is required');
        return;
      }

      if (!templateData.title_template) {
        setError('Title template is required');
        return;
      }

      if (!templateData.message_template) {
        setError('Message template is required');
        return;
      }

      if (!templateData.category) {
        setError('Category is required');
        return;
      }

      let result: NotificationTemplate;
      if (template && template.template_id) {
        // Update existing template
        result = await notificationService.updateTemplate(template.template_id, templateData);
      } else {
        // Create new template
        result = await notificationService.createTemplate(templateData);
      }

      onSave(result);
    } catch (err) {
      console.error('Failed to save template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
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
            <Label htmlFor="name">
              Template Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Booking Confirmation SMS"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={(value) => setNotificationType(value as NotificationTemplate['notification_type'])}
            />
          </div>

          <div className="flex items-end">
            <Switch
              label="Active"
              defaultChecked={isActive}
              onChange={setIsActive}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="titleTemplate">
            Title Template *
          </Label>
          <Input
            id="titleTemplate"
            type="text"
            placeholder="e.g., Booking Confirmed"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <Label>
            Message Template *
          </Label>
          <TextArea
            rows={4}
            placeholder="e.g., Hello {{customer_name}}, your booking #{{booking_id}} has been confirmed for {{date}}."
            value={messageTemplate}
            onChange={(value) => setMessageTemplate(value)}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Use double curly braces to define variables (e.g., {'{{'}variable_name{'}'})
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Label>Variables</Label>
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
                    placeholder="Example value"
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
          
          {variableInputs.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No variables defined. Add variables to make your template dynamic.
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
          <Button
            type="submit"
          >
            {template?.template_id ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}