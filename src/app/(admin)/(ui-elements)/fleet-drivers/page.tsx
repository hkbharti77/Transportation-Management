"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { driverService, Driver } from "@/services/driverService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function FleetDriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    user_id: 0,
    employee_id: "",
    license_number: "",
    license_type: "LMV",
    license_expiry: "",
    experience_years: 0,
    phone_emergency: "",
    address: "",
    blood_group: "A+",
    assigned_truck_id: null as number | null,
    shift_start: "09:00",
    shift_end: "17:00"
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver || !formData.employee_id.trim() || !formData.license_number.trim()) return;

    try {
      // Convert date to ISO format for API
      const formattedData = {
        ...formData,
        license_expiry: formData.license_expiry ? new Date(formData.license_expiry + 'T00:00:00Z').toISOString() : formData.license_expiry
      };
      await driverService.updateDriver(editingDriver.id!, formattedData);
      setFormData({
        user_id: 0,
        employee_id: "",
        license_number: "",
        license_type: "LMV",
        license_expiry: "",
        experience_years: 0,
        phone_emergency: "",
        address: "",
        blood_group: "A+",
        assigned_truck_id: null,
        shift_start: "09:00",
        shift_end: "17:00"
      });
      setEditingDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to update driver:', error);
      alert('Failed to update driver. Please try again.');
    }
  };

  const handleDeleteDriver = async (driverId: number) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      await driverService.deleteDriver(driverId);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to delete driver:', error);
      alert('Failed to delete driver. Please try again.');
    }
  };

  const startEdit = (driver: Driver) => {
    setEditingDriver(driver);
    
    // Convert ISO date to YYYY-MM-DD format for date input
    const formatDateForInput = (isoDate: string) => {
      if (!isoDate) return "";
      try {
        return new Date(isoDate).toISOString().split('T')[0];
      } catch {
        return isoDate;
      }
    };

    setFormData({
      user_id: driver.user_id,
      employee_id: driver.employee_id,
      license_number: driver.license_number,
      license_type: driver.license_type,
      license_expiry: formatDateForInput(driver.license_expiry),
      experience_years: driver.experience_years,
      phone_emergency: driver.phone_emergency,
      address: driver.address,
      blood_group: driver.blood_group,
      assigned_truck_id: driver.assigned_truck_id || null,
      shift_start: driver.shift_start,
      shift_end: driver.shift_end
    });
  };

  const cancelEdit = () => {
    setEditingDriver(null);
    setFormData({
      user_id: 0,
      employee_id: "",
      license_number: "",
      license_type: "LMV",
      license_expiry: "",
      experience_years: 0,
      phone_emergency: "",
      address: "",
      blood_group: "A+",
      assigned_truck_id: null,
      shift_start: "09:00",
      shift_end: "17:00"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Fleet Drivers Management
          </h2>
        <div className="flex space-x-3">
          <Button
            onClick={() => router.push('/fleet-drivers/create')}
            className="px-4 py-2"
          >
            Create New Driver
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editingDriver && (
        <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Edit Driver
          </h3>
          <form onSubmit={handleUpdateDriver} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee ID *
                </label>
                <Input
                  name="employee_id"
                  type="text"
                  defaultValue={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  placeholder="Enter employee ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number *
                </label>
                <Input
                  name="license_number"
                  type="text"
                  defaultValue={formData.license_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                  placeholder="Enter license number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type
                </label>
                <select
                  value={formData.license_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_type: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="LMV">Light Motor Vehicle (LMV)</option>
                  <option value="HMV">Heavy Motor Vehicle (HMV)</option>
                  <option value="MCWG">Motor Cycle With Gear (MCWG)</option>
                  <option value="MCWOG">Motor Cycle Without Gear (MCWOG)</option>
                  <option value="TRANS">Transport Vehicle</option>
                  <option value="PSV">Public Service Vehicle</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Expiry
                </label>
                <Input
                  name="license_expiry"
                  type="date"
                  defaultValue={formData.license_expiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_expiry: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience (Years)
                </label>
                <Input
                  name="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  defaultValue={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Phone
                </label>
                <Input
                  name="phone_emergency"
                  type="tel"
                  defaultValue={formData.phone_emergency}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_emergency: e.target.value }))}
                  placeholder="Enter emergency phone"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <Input
                name="address"
                type="text"
                defaultValue={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Driver
          </Button>
        </div>
          </form>
        </div>
      )}

      {/* Drivers List */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Available Drivers ({drivers.length})
            </h3>
        </div>
        
        {drivers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No drivers available. Create your first driver to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Employee ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      License Info
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Experience
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Shift
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {driver.employee_id}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div>
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{driver.license_number}</div>
                          <div className="text-xs text-gray-400">{driver.license_type}</div>
                          <div className="text-xs text-gray-400">
                            Expires: {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.experience_years} years
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={
                            driver.status === 'active' ? 'success' :
                            driver.status === 'suspended' ? 'error' : 'warning'
                          }
                        >
                          {driver.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.shift_start} - {driver.shift_end}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(driver)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDriver(driver.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
