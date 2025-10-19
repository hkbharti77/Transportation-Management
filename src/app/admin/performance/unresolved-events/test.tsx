"use client";
import React, { useEffect, useState } from "react";
import { performanceService, BehaviorEvent } from "@/services/performanceService";

const TestUnresolvedEvents = () => {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnresolvedEvents = async () => {
      try {
        setLoading(true);
        const data = await performanceService.getUnresolvedDriverBehaviorEvents(3);
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching unresolved events:", err);
        setError("Failed to fetch unresolved events");
      } finally {
        setLoading(false);
      }
    };

    fetchUnresolvedEvents();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Unresolved Behavior Events Test</h1>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
};

export default TestUnresolvedEvents;