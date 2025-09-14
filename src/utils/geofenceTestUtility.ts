// Geofence Test Utility
// This file contains test functions to verify the geofence API integration

import { trackingService, CreateGeofenceRequest } from '@/services/trackingService';

export interface TestResult {
  success: boolean;
  message: string;
  data?: unknown; // Changed from 'any' to 'unknown' for better type safety
  error?: string;
}

export class GeofenceTester {
  private static async testGetGeofences(): Promise<TestResult> {
    try {
      const geofences = await trackingService.getGeofences();
      
      return {
        success: true,
        message: 'Successfully retrieved geofences',
        data: geofences
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve geofences',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testCreateGeofence(): Promise<TestResult> {
    try {
      const geofenceData: CreateGeofenceRequest = {
        name: 'Test Geofence',
        description: 'Test geofence for validation',
        latitude: 28.6139,
        longitude: 77.2090,
        radius: 5,
        is_active: true
      };

      const result = await trackingService.createGeofence(geofenceData);
      
      return {
        success: true,
        message: 'Successfully created geofence',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create geofence',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testUpdateGeofence(): Promise<TestResult> {
    try {
      // First get existing geofences
      const geofences = await trackingService.getGeofences();
      
      if (geofences.length === 0) {
        return {
          success: false,
          message: 'No geofences available to update',
          error: 'Create a geofence first'
        };
      }
      
      const geofenceId = geofences[0].geofence_id!;
      const updateData = {
        name: 'Updated Test Geofence',
        description: 'Updated description',
        is_active: false
      };

      const result = await trackingService.updateGeofence(geofenceId, updateData);
      
      return {
        success: true,
        message: 'Successfully updated geofence',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update geofence',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testDeleteGeofence(): Promise<TestResult> {
    try {
      // First get existing geofences
      const geofences = await trackingService.getGeofences();
      
      // Find a test geofence to delete
      const testGeofence = geofences.find(g => g.name === 'Test Geofence' || g.name === 'Updated Test Geofence');
      
      if (!testGeofence) {
        return {
          success: false,
          message: 'No test geofence found to delete',
          error: 'Create a test geofence first'
        };
      }
      
      await trackingService.deleteGeofence(testGeofence.geofence_id!);
      
      return {
        success: true,
        message: 'Successfully deleted geofence',
        data: { geofence_id: testGeofence.geofence_id }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete geofence',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public static async runAllTests(): Promise<{
    getGeofences: TestResult;
    createGeofence: TestResult;
    updateGeofence: TestResult;
    deleteGeofence: TestResult;
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  }> {
    console.log('🧪 Starting Geofence API Tests...\n');

    const getGeofences = await this.testGetGeofences();
    const createGeofence = await this.testCreateGeofence();
    const updateGeofence = await this.testUpdateGeofence();
    const deleteGeofence = await this.testDeleteGeofence();

    const results = [getGeofences, createGeofence, updateGeofence, deleteGeofence];
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('📊 Test Results:');
    console.log(`✅ Get Geofences: ${getGeofences.success ? 'PASS' : 'FAIL'} - ${getGeofences.message}`);
    console.log(`✅ Create Geofence: ${createGeofence.success ? 'PASS' : 'FAIL'} - ${createGeofence.message}`);
    console.log(`✅ Update Geofence: ${updateGeofence.success ? 'PASS' : 'FAIL'} - ${updateGeofence.message}`);
    console.log(`✅ Delete Geofence: ${deleteGeofence.success ? 'PASS' : 'FAIL'} - ${deleteGeofence.message}`);
    console.log(`\n📈 Summary: ${passed}/${results.length} tests passed`);

    return {
      getGeofences,
      createGeofence,
      updateGeofence,
      deleteGeofence,
      summary: {
        total: results.length,
        passed,
        failed
      }
    };
  }
}

export default GeofenceTester;