'use client';

// Removed unused React import
import { redirect } from 'next/navigation';

export default function AnalyticsRedirect() {
  // Redirect to the main analytics page
  redirect('/admin/analytics');
}


