// Location Tracking API Test Utility
// This file contains test functions to verify the location tracking API integration

import { trackingService } from '@/services/trackingService';

export interface TestResult {
  success: boolean;
  message: string;
  data?: unknown; // Changed from 'any' to 'unknown' for better type safety
  error?: string;
}

export class LocationTrackingTester {
  private static async testLocationSubmission(): Promise<TestResult> {
    try {
      const testLocation = {
        latitude: 28.6139,
        longitude: 77.2090,
        altitude: 215,
        speed: 54,
        heading: 92,
        accuracy: 5,
        location_type: 'gps' as const,
        truck_id: 1,
        timestamp: new Date().toISOString()
      };

      const result = await trackingService.submitLocation(testLocation);
      
      return {
        success: true,
        message: 'Location submission successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Location submission failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testLocationUpdate(): Promise<TestResult> {
    try {
      const updateData = {
        latitude: 19.0760,
        longitude: 72.8777,
        altitude: 14,
        speed: 45,
        heading: 120,
        accuracy: 4,
        location_type: 'gps' as const
      };

      // Try to update location ID 2 (as per your curl example)
      const result = await trackingService.updateLocation(2, updateData);
      
      return {
        success: true,
        message: 'Location update successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Location update failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testLocationHistory(): Promise<TestResult> {
    try {
      const history = await trackingService.getLocationHistory(1);
      
      return {
        success: true,
        message: 'Location history retrieval successful',
        data: history
      };
    } catch (error) {
      return {
        success: false,
        message: 'Location history retrieval failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testTrackingStats(): Promise<TestResult> {
    try {
      const stats = await trackingService.getTrackingStats();
      
      return {
        success: true,
        message: 'Tracking stats retrieval successful',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tracking stats retrieval failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public static async runAllTests(): Promise<{
    submission: TestResult;
    update: TestResult;
    history: TestResult;
    stats: TestResult;
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  }> {
    console.log('🧪 Starting Location Tracking API Tests...\n');

    const submission = await this.testLocationSubmission();
    const update = await this.testLocationUpdate();
    const history = await this.testLocationHistory();
    const stats = await this.testTrackingStats();

    const results = [submission, update, history, stats];
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('📊 Test Results:');
    console.log(`✅ Submission: ${submission.success ? 'PASS' : 'FAIL'} - ${submission.message}`);
    console.log(`✅ Update: ${update.success ? 'PASS' : 'FAIL'} - ${update.message}`);
    console.log(`✅ History: ${history.success ? 'PASS' : 'FAIL'} - ${history.message}`);
    console.log(`✅ Stats: ${stats.success ? 'PASS' : 'FAIL'} - ${stats.message}`);
    console.log(`\n📈 Summary: ${passed}/${results.length} tests passed`);

    return {
      submission,
      update,
      history,
      stats,
      summary: {
        total: results.length,
        passed,
        failed
      }
    };
  }

  public static async testBrowserGeolocation(): Promise<TestResult> {
    try {
      const position = await trackingService.getCurrentBrowserLocation();
      
      return {
        success: true,
        message: 'Browser geolocation successful',
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Browser geolocation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as unknown as { LocationTrackingTester: typeof LocationTrackingTester }).LocationTrackingTester = LocationTrackingTester;
}