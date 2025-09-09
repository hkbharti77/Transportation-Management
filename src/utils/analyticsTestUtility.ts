/**
 * Analytics Service Test Utility
 * 
 * This file demonstrates how to use the new analytics service endpoints.
 * Use this for testing and development purposes.
 */

import { analyticsService } from '@/services/analyticsService';

export class AnalyticsTestUtility {
  
  /**
   * Test all new analytics endpoints
   */
  static async testAllAnalyticsEndpoints() {
    console.group('🔧 Testing Analytics Service Endpoints');
    
    try {
      // Test Service Summary
      console.log('📊 Testing Service Summary...');
      const serviceSummary = await analyticsService.getServiceSummary();
      console.log('Service Summary:', serviceSummary);
      
      // Test Vehicle Maintenance
      console.log('🚗 Testing Vehicle Maintenance Analytics...');
      const vehicleMaintenance = await analyticsService.getVehicleMaintenanceAnalytics();
      console.log('Vehicle Maintenance:', vehicleMaintenance);
      
      // Test Parts Inventory
      console.log('📦 Testing Parts Inventory Analytics...');
      const partsInventory = await analyticsService.getPartsInventoryAnalytics();
      console.log('Parts Inventory:', partsInventory);
      
      // Test Maintenance Schedule
      console.log('📅 Testing Maintenance Schedule...');
      const maintenanceSchedule = await analyticsService.getMaintenanceSchedule(30);
      console.log('Maintenance Schedule:', maintenanceSchedule);
      
      // Test Service Cost Analysis
      console.log('💰 Testing Service Cost Analysis...');
      const costAnalysis = await analyticsService.getServiceCostAnalysis(
        undefined, // start date
        undefined, // end date  
        'month'    // group by month
      );
      console.log('Cost Analysis:', costAnalysis);
      
      console.log('✅ All analytics endpoints tested successfully!');
      return {
        serviceSummary,
        vehicleMaintenance,
        partsInventory,
        maintenanceSchedule,
        costAnalysis
      };
      
    } catch (error) {
      console.error('❌ Error testing analytics endpoints:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test service summary with date range
   */
  static async testServiceSummaryWithDates() {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    console.log('📊 Testing Service Summary with date range:', { startDate, endDate });
    return await analyticsService.getServiceSummary(startDate, endDate);
  }

  /**
   * Test cost analysis with different grouping
   */
  static async testCostAnalysisGroupings() {
    const results = {
      byMonth: await analyticsService.getServiceCostAnalysis(undefined, undefined, 'month'),
      byWeek: await analyticsService.getServiceCostAnalysis(undefined, undefined, 'week'),
      byDay: await analyticsService.getServiceCostAnalysis(undefined, undefined, 'day'),
      byVehicle: await analyticsService.getServiceCostAnalysis(undefined, undefined, 'vehicle'),
      byServiceType: await analyticsService.getServiceCostAnalysis(undefined, undefined, 'service_type')
    };
    
    console.log('💰 Cost Analysis by different groupings:', results);
    return results;
  }

  /**
   * Test maintenance schedule with different day ranges
   */
  static async testMaintenanceScheduleRanges() {
    const results = {
      next7Days: await analyticsService.getMaintenanceSchedule(7),
      next30Days: await analyticsService.getMaintenanceSchedule(30),
      next90Days: await analyticsService.getMaintenanceSchedule(90)
    };
    
    console.log('📅 Maintenance Schedule for different ranges:', results);
    return results;
  }

  /**
   * Test backend connection
   */
  static async testBackendConnection() {
    console.log('🔌 Testing backend connection...');
    const isConnected = await analyticsService.checkBackendConnection();
    console.log('Backend connection status:', isConnected ? '✅ Connected' : '❌ Disconnected');
    return isConnected;
  }

  /**
   * Generate analytics summary report
   */
  static async generateAnalyticsSummaryReport() {
    try {
      console.group('📋 Generating Analytics Summary Report');
      
      const data = await this.testAllAnalyticsEndpoints();
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalServices: data.serviceSummary?.summary.total_services || 0,
          totalServiceCost: data.serviceSummary?.summary.total_cost || 0,
          totalVehicles: data.vehicleMaintenance?.total_vehicles || 0,
          vehiclesNeedingMaintenance: data.vehicleMaintenance?.vehicles_requiring_maintenance || 0,
          vehiclesOverdue: data.vehicleMaintenance?.vehicles_overdue || 0,
          totalPartsValue: data.partsInventory?.summary.total_inventory_value || 0,
          upcomingServices: data.maintenanceSchedule?.total_upcoming_services || 0,
          totalCostThisPeriod: data.costAnalysis?.total_cost || 0
        },
        details: data
      };
      
      console.log('📊 Analytics Summary Report:', report);
      console.groupEnd();
      
      return report;
      
    } catch (error) {
      console.error('❌ Error generating analytics report:', error);
      console.groupEnd();
      throw error;
    }
  }
}

// Export the test utility for use in components or console
export default AnalyticsTestUtility;

// Example usage in browser console:
// import AnalyticsTestUtility from './analyticsTestUtility';
// AnalyticsTestUtility.testAllAnalyticsEndpoints();
// AnalyticsTestUtility.generateAnalyticsSummaryReport();