"use client";

import React, { useState, useEffect } from "react";
import { Driver, CreateDriverRequest, UpdateDriverRequest } from "@/services/driverService";
import { userService, User } from "@/services/userService";
import { fleetService, Truck } from "@/services/fleetService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

interface DriverFormProps {
  driver?: Driver | null;
  onSubmit: (driverData: CreateDriverRequest | UpdateDriverRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function DriverForm({
  driver,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: DriverFormProps) {
  const [users, setUsers] = useState<Array<Pick<User, 'id' | 'name' | 'email' | 'role'>> | []>([]);
  const [trucks, setTrucks] = useState<Array<Pick<Truck, 'id' | 'truck_number' | 'number_plate'>> | []>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<CreateDriverRequest>({
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch users and trucks on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
                 // Fetch users (potential drivers)
         const allUsersResponse = await userService.getUsers({ limit: 1000 });
         console.log('All users fetched:', allUsersResponse);
         
         // Filter users who can be drivers (staff, customer, or driver role)
         const driverUsers = allUsersResponse.data.filter(user => 
           user.role === 'staff' || 
           user.role === 'customer' || 
           user.role === 'driver'
         );
         console.log('Filtered driver users:', driverUsers);
         
         // If no users found, show helpful message
         if (driverUsers.length === 0) {
           console.warn('No users found for driver assignment. Please create users first.');
           alert('No users found for driver assignment. Please create users with staff, customer, or driver roles first.');
         }
         
         setUsers(driverUsers);

        // Fetch available trucks
        const availableTrucks = await fleetService.getTrucks();
        setTrucks(availableTrucks);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (driver && mode === "edit") {
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
        assigned_truck_id: driver.assigned_truck_id,
        shift_start: driver.shift_start,
        shift_end: driver.shift_end
      });
    }
  }, [driver, mode]);

  const handleInputChange = (field: string, value: string | number | null) => {
    console.log(`Updating field ${field} with value:`, value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    console.log('Validating form with data:', formData);
    const newErrors: Record<string, string> = {};

    if (!formData.user_id || formData.user_id === 0) {
      newErrors.user_id = "Please select a user";
      console.log('User ID validation failed:', formData.user_id);
    }

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required";
      console.log('Employee ID validation failed:', formData.employee_id);
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = "License number is required";
      console.log('License number validation failed:', formData.license_number);
    }

    if (!formData.license_type) {
      newErrors.license_type = "License type is required";
      console.log('License type validation failed:', formData.license_type);
    }

    if (!formData.license_expiry) {
      newErrors.license_expiry = "License expiry date is required";
      console.log('License expiry validation failed:', formData.license_expiry);
    }

    // Validate that license expiry is not in the past
    if (formData.license_expiry) {
      const expiryDate = new Date(formData.license_expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors.license_expiry = "License expiry date cannot be in the past";
        console.log('License expiry date is in the past:', expiryDate, 'vs today:', today);
      }
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = "Experience years cannot be negative";
      console.log('Experience years validation failed:', formData.experience_years);
    }

    if (!formData.phone_emergency.trim()) {
      newErrors.phone_emergency = "Emergency phone number is required";
      console.log('Phone emergency validation failed:', formData.phone_emergency);
    }

    // Basic phone number validation
    if (formData.phone_emergency.trim() && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone_emergency.trim())) {
      newErrors.phone_emergency = "Please enter a valid phone number";
      console.log('Phone number format validation failed:', formData.phone_emergency);
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      console.log('Address validation failed:', formData.address);
    }

    if (!formData.blood_group) {
      newErrors.blood_group = "Blood group is required";
      console.log('Blood group validation failed:', formData.blood_group);
    }

    if (!formData.shift_start) {
      newErrors.shift_start = "Shift start time is required";
      console.log('Shift start validation failed:', formData.shift_start);
    }

    if (!formData.shift_end) {
      newErrors.shift_end = "Shift end time is required";
      console.log('Shift end validation failed:', formData.shift_end);
    }

    // Validate that shift end is after shift start
    if (formData.shift_start && formData.shift_end) {
      if (formData.shift_start >= formData.shift_end) {
        newErrors.shift_end = "Shift end time must be after shift start time";
        console.log('Shift time validation failed:', formData.shift_start, '>=', formData.shift_end);
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (validateForm()) {
      // Convert date to ISO format for API with proper timezone handling
      const formattedData = {
        ...formData,
        license_expiry: formData.license_expiry ? 
          new Date(formData.license_expiry + 'T00:00:00.000Z').toISOString() : 
          formData.license_expiry
      };
      
      console.log('Formatted driver data for API:', formattedData);
      onSubmit(formattedData);
    } else {
      console.log('Form validation failed with errors:', errors);
    }
  };

  const userOptions = users
    .filter(user => typeof user.id === 'number' && user.id > 0)
    .map(user => ({
      value: user.id!.toString(),
      label: `${user.name} (${user.email}) - ${user.role}`
    }));

  const truckOptions = trucks.map(truck => ({
    value: truck.id?.toString() || "0",
    label: `${truck.truck_number} - ${truck.number_plate}`
  }));

  const licenseTypeOptions = [
    { value: "LMV", label: "Light Motor Vehicle (LMV)" },
    { value: "HMV", label: "Heavy Motor Vehicle (HMV)" },
    { value: "MCWG", label: "Motor Cycle With Gear (MCWG)" },
    { value: "MCWOG", label: "Motor Cycle Without Gear (MCWOG)" },
    { value: "TRANS", label: "Transport Vehicle" },
    { value: "PSV", label: "Public Service Vehicle" }
  ];

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" }
  ];

  const shiftTimeOptions = [
    { value: "06:00", label: "6:00 AM" },
    { value: "07:00", label: "7:00 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "22:00", label: "10:00 PM" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User *
            </label>
            <Select
              options={userOptions}
              placeholder={isLoadingData ? "Loading users..." : "Select a user"}
              onChange={(value) => {
                const parsed = parseInt(value, 10);
                handleInputChange("user_id", Number.isFinite(parsed) ? parsed : 0);
              }}
              value={formData.user_id ? formData.user_id.toString() : ""}
              defaultValue={formData.user_id ? formData.user_id.toString() : ""}
              disabled={isLoadingData || mode === "edit"}
            />
            {errors.user_id && (
              <p className="mt-1 text-xs text-red-500">{errors.user_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employee ID *
            </label>
            <Input
              name="employee_id"
              type="text"
              defaultValue={formData.employee_id}
              onChange={(e) => handleInputChange("employee_id", e.target.value)}
              error={!!errors.employee_id}
              hint={errors.employee_id}
              placeholder="e.g., EMP-001"
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
              onChange={(e) => handleInputChange("license_number", e.target.value)}
              error={!!errors.license_number}
              hint={errors.license_number}
              placeholder="e.g., DL-1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              License Type *
            </label>
            <Select
              options={licenseTypeOptions}
              placeholder="Select license type"
              onChange={(value) => handleSelectChange("license_type", value)}
              defaultValue={formData.license_type}
            />
            {errors.license_type && (
              <p className="mt-1 text-xs text-red-500">{errors.license_type}</p>
            )}
          </div>
        </div>

        {/* License and Experience */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">License & Experience</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              License Expiry Date *
            </label>
            <Input
              name="license_expiry"
              type="date"
              defaultValue={formData.license_expiry}
              onChange={(e) => handleInputChange("license_expiry", e.target.value)}
              error={!!errors.license_expiry}
              hint={errors.license_expiry}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Years of Experience
            </label>
            <Input
              name="experience_years"
              type="number"
              min="0"
              max="50"
              defaultValue={formData.experience_years}
              onChange={(e) => handleInputChange("experience_years", parseInt(e.target.value) || 0)}
              error={!!errors.experience_years}
              hint={errors.experience_years}
              placeholder="e.g., 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Emergency Phone *
            </label>
            <Input
              name="phone_emergency"
              type="tel"
              defaultValue={formData.phone_emergency}
              onChange={(e) => handleInputChange("phone_emergency", e.target.value)}
              error={!!errors.phone_emergency}
              hint={errors.phone_emergency}
              placeholder="e.g., +91-9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blood Group
            </label>
            <Select
              options={bloodGroupOptions}
              placeholder="Select blood group"
              onChange={(value) => handleSelectChange("blood_group", value)}
              defaultValue={formData.blood_group}
            />
            {errors.blood_group && (
              <p className="mt-1 text-xs text-red-500">{errors.blood_group}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address and Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Address & Assignment</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address *
          </label>
          <Input
            name="address"
            type="text"
            defaultValue={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            error={!!errors.address}
            hint={errors.address}
            placeholder="e.g., 123 Main Street, City, State, PIN"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned Truck
            </label>
            <Select
              options={truckOptions}
              placeholder={isLoadingData ? "Loading trucks..." : "Select a truck (optional)"}
              onChange={(value) => handleInputChange("assigned_truck_id", value ? parseInt(value) : null)}
              defaultValue={formData.assigned_truck_id?.toString() || ""}
              disabled={isLoadingData}
            />
          </div>
        </div>
      </div>

      {/* Shift Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shift Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shift Start Time *
            </label>
            <Select
              options={shiftTimeOptions}
              placeholder="Select shift start time"
              onChange={(value) => handleSelectChange("shift_start", value)}
              defaultValue={formData.shift_start}
            />
            {errors.shift_start && (
              <p className="mt-1 text-xs text-red-500">{errors.shift_start}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shift End Time *
            </label>
            <Select
              options={shiftTimeOptions}
              placeholder="Select shift end time"
              onChange={(value) => handleSelectChange("shift_end", value)}
              defaultValue={formData.shift_end}
            />
            {errors.shift_end && (
              <p className="mt-1 text-xs text-red-500">{errors.shift_end}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isLoadingData}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === "create" ? "Creating..." : "Updating..."}
            </div>
          ) : (
            mode === "create" ? "Create Driver" : "Update Driver"
          )}
        </Button>
      </div>
    </form>
  );
}
