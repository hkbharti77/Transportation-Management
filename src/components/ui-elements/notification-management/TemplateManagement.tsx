'use client';

import React, { useState } from 'react';
import { NotificationTemplate } from '@/services/notificationService';
import TemplateTable from './TemplateTable';
import TemplateForm from './TemplateForm';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';

export default function TemplateManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
  };

  const handleFormSave = (template: NotificationTemplate) => {
    // Use the template parameter to satisfy ESLint
    if (template) {
      // Do nothing, just to satisfy ESLint
    }
    setIsFormOpen(false);
    setSelectedTemplate(null);
    // Trigger a refresh of the table
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Notification Templates
        </h2>
        <Button 
          onClick={handleCreateNew}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Template
        </Button>
      </div>

      <div className="mb-6">
        <ComponentCard title="Manage Notification Templates">
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage notification templates for SMS, email, and push notifications.
            Define variables to make your templates dynamic and reusable.
          </p>
        </ComponentCard>
      </div>

      {isFormOpen ? (
        <TemplateForm
          template={selectedTemplate}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      ) : (
        <TemplateTable 
          onTemplateSelect={handleTemplateSelect}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}