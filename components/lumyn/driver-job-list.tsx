'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  deliveryNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number | null;
  totalAmount: number;
  customer: {
    firstName: string;
    lastName: string;
  };
}

interface DriverJobListProps {
  initialJobs: Job[];
  onAcceptJob: (jobId: string) => Promise<void>;
}

export function DriverJobList({ initialJobs, onAcceptJob }: DriverJobListProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);

  const refreshJobs = async () => {
    const response = await fetch('/api/lumyn/drivers/deliveries');
    if (response.ok) {
      const newJobs = await response.json();
      setJobs(newJobs);
    }
  };

  const handleAccept = async (jobId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/lumyn/drivers/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: jobId, action: 'accept' }),
      });

      if (response.ok) {
        await refreshJobs();
        onAcceptJob(jobId);
      }
    } catch (error) {
      console.error('Failed to accept job', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs available</p>
          <Button onClick={refreshJobs} variant="outline" className="mt-4">
            Refresh
          </Button>
        </div>
      ) : (
        jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">#{job.deliveryNumber}</h3>
                  <Badge>KES {job.totalAmount.toLocaleString()}</Badge>
                </div>
                <Badge variant="outline">{job.customer.firstName} {job.customer.lastName}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span>📍</span>
                <span>{job.pickupAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm ml-6">
                <span>→</span>
                <span>{job.dropoffAddress}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {job.distanceKm ? `${job.distanceKm.toFixed(1)}km` : 'Distance TBD'}
              </div>
              <Button 
                onClick={() => handleAccept(job.id)}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? 'Accepting...' : `Accept Job`}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

