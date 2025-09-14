"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, SearchIcon } from "@/icons";

export default function UserTicketsLookupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate user ID
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      setError("Please enter a valid user ID");
      return;
    }
    
    // Navigate to user tickets page
    router.push(`/public-services/tickets/user/${userIdNum}`);
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <Button 
          onClick={() => router.push("/public-services/tickets")} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Tickets
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          View User Tickets
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a user ID to view their booked tickets
        </p>
      </div>

      <ComponentCard title="">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              User ID
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              placeholder="Enter user ID"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
          >
            <SearchIcon className="h-4 w-4" />
            View Tickets
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}