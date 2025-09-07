'use client';

import React from 'react';
import { Trip } from '@/services/tripService';
import TripForm from './TripForm';
import { Modal } from '@/components/ui/modal';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
  onSuccess: () => void;
  title?: string;
}

export default function TripModal({ 
  isOpen, 
  onClose, 
  trip, 
  onSuccess,
  title 
}: TripModalProps) {
  
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const modalTitle = title || (trip ? 'Edit Trip' : 'Create New Trip');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl mx-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {modalTitle}
          </h2>
        </div>
        <TripForm
          trip={trip}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}