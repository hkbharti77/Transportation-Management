'use client';

import React, { useState } from 'react';
import { Notification, BroadcastNotification } from '@/services/notificationService';
import NotificationTable from './NotificationTable';
import NotificationForm from './NotificationForm';
import BroadcastTable from './BroadcastTable';
import BroadcastForm from './BroadcastForm';
import TemplateNotificationForm from './TemplateNotificationForm';
import NotificationStats from './NotificationStats';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';

type ActiveTab = 'individual' | 'broadcast' | 'template' | 'stats';

export default function NotificationManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('individual');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastNotification | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [templateResult, setTemplateResult] = useState<{success: boolean; notifications_created: number; notifications_sent: number; failed_count: number; errors: string[]} | null>(null);

  // Get current user ID (in a real app, this would come from context or props)
  const currentUserId = 1;

  const handleNotificationSelect = (notification: Notification) => {
    setSelectedNotification(notification);
    setSelectedBroadcast(null);
    setIsFormOpen(true);
  };

  const handleBroadcastSelect = (broadcast: BroadcastNotification) => {
    setSelectedBroadcast(broadcast);
    setSelectedNotification(null);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedNotification(null);
    setSelectedBroadcast(null);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedNotification(null);
    setSelectedBroadcast(null);
  };

  const handleFormSave = (item: Notification | BroadcastNotification) => {
    // Use the item parameter to satisfy ESLint
    if (item) {
      // Do nothing, just to satisfy ESLint
    }
    setIsFormOpen(false);
    setSelectedNotification(null);
    setSelectedBroadcast(null);
    // Trigger a refresh of the table
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTemplateSend = (result: {success: boolean; notifications_created: number; notifications_sent: number; failed_count: number; errors: string[]} | null) => {
    setTemplateResult(result);
    // Trigger a refresh of the individual notifications table
    setRefreshTrigger(prev => prev + 1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'individual':
        return isFormOpen ? (
          <NotificationForm
            notification={selectedNotification}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        ) : (
          <NotificationTable 
            onNotificationSelect={handleNotificationSelect}
            refreshTrigger={refreshTrigger}
          />
        );
      
      case 'broadcast':
        return isFormOpen ? (
          <BroadcastForm
            broadcast={selectedBroadcast}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            currentUserId={currentUserId}
          />
        ) : (
          <BroadcastTable 
            onBroadcastSelect={handleBroadcastSelect}
            refreshTrigger={refreshTrigger}
          />
        );
      
      case 'template':
        return templateResult ? (
          <ComponentCard title="Template Notification Result">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notification Send Result
                </h3>
                <Button onClick={() => setTemplateResult(null)}>Send Another</Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-3 h-3 rounded-full ${templateResult.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Success: {templateResult.success ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifications Created</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateResult.notifications_created}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifications Sent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateResult.notifications_sent}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Failed Count</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateResult.failed_count}</p>
                  </div>
                </div>
                
                {templateResult.errors && templateResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Errors:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {templateResult.errors.map((error, index) => (
                        <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ComponentCard>
        ) : (
          <TemplateNotificationForm
            onSend={handleTemplateSend}
            onCancel={handleFormCancel}
          />
        );
      
      case 'stats':
        return <NotificationStats refreshTrigger={refreshTrigger} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Notifications
        </h2>
        {activeTab !== 'template' && activeTab !== 'stats' && !isFormOpen && (
          <Button 
            onClick={handleCreateNew}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Notification
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('individual')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'individual'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Individual Notifications
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'broadcast'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Broadcast Notifications
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'template'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Template Notifications
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>
      </div>

      <div className="mb-6">
        <ComponentCard title="Manage Notifications">
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'individual' && 'Create and manage individual notifications for specific users.'}
            {activeTab === 'broadcast' && 'Create and manage broadcast notifications to groups of users.'}
            {activeTab === 'template' && 'Send notifications to multiple users using templates.'}
            {activeTab === 'stats' && 'View statistics and analytics for all notifications.'}
          </p>
        </ComponentCard>
      </div>

      {renderTabContent()}
    </div>
  );
}