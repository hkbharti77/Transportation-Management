// ETA Calculation Test Utility
// This file contains test functions to verify the ETA calculation API integration

import { trackingService, ETARequest, ETAResponse } from '@/services/trackingService';

export interface TestResult {
  success: boolean;
  message: string;
  data?: ETAResponse;
  error?: string;
}

export class ETATester {
  private static async testETACalculation(): Promise<TestResult> {
    try {
      // Test data for ETA calculation
      const etaRequest: ETARequest = {
        source_lat: 40.7128,    // New York City
        source_lng: -74.0060,
        dest_lat: 34.0522,      // Los Angeles
        dest_lng: -118.2437,
        transport_mode: 'driving'
      };

      const result = await trackingService.calculateETA(etaRequest);
      
      return {
        success: true,
        message: 'ETA calculation successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'ETA calculation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testETACalculationWithInvalidData(): Promise<TestResult> {
    try {
      // Test with invalid coordinates
      const invalidRequest: ETARequest = {
        source_lat: 100,        // Invalid latitude
        source_lng: -74.0060,
        dest_lat: 34.0522,
        dest_lng: -118.2437,
        transport_mode: 'driving'
      };

      const result = await trackingService.calculateETA(invalidRequest);
      
      // If we get here without an error, the validation failed
      return {
        success: false,
        message: 'ETA calculation should have failed with invalid data',
        data: result
      };
    } catch (error) {
      // This is expected - validation should fail
      return {
        success: true,
        message: 'ETA calculation correctly rejected invalid data',
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }

  private static async testWalkingETACalculation(): Promise<TestResult> {
    try {
      // Test walking mode
      const walkingRequest: ETARequest = {
        source_lat: 40.7580,    // Times Square
        source_lng: -73.9855,
        dest_lat: 40.7505,      // Rockefeller Center
        dest_lng: -73.9934,
        transport_mode: 'walking'
      };

      const result = await trackingService.calculateETA(walkingRequest);
      
      return {
        success: true,
        message: 'Walking ETA calculation successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Walking ETA calculation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public static async runAllTests(): Promise<{
    basicETA: TestResult;
    invalidData: TestResult;
    walkingETA: TestResult;
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  }> {
    console.log('🧪 Starting ETA Calculation API Tests...\n');

    const basicETA = await this.testETACalculation();
    const invalidData = await this.testETACalculationWithInvalidData();
    const walkingETA = await this.testWalkingETACalculation();

    const results = [basicETA, invalidData, walkingETA];
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('📊 Test Results:');
    console.log(`✅ Basic ETA: ${basicETA.success ? 'PASS' : 'FAIL'} - ${basicETA.message}`);
    console.log(`✅ Invalid Data Handling: ${invalidData.success ? 'PASS' : 'FAIL'} - ${invalidData.message}`);
    console.log(`✅ Walking ETA: ${walkingETA.success ? 'PASS' : 'FAIL'} - ${walkingETA.message}`);
    console.log(`\n📈 Summary: ${passed}/${results.length} tests passed`);

    return {
      basicETA,
      invalidData,
      walkingETA,
      summary: {
        total: results.length,
        passed,
        failed
      }
    };
  }
}

export default ETATester;