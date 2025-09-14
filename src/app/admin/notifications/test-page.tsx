'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { NotificationTemplate } from '@/services/notificationService';

export default function TestNotificationService() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await notificationService.getTemplates({});
        setTemplates(response.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return <div>Loading notification templates...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Notification Templates</h1>
      <ul>
        {templates.map((template) => (
          <li key={template.template_id}>
            <strong>{template.name}</strong> - {template.category} ({template.notification_type})
          </li>
        ))}
      </ul>
    </div>
  );
}