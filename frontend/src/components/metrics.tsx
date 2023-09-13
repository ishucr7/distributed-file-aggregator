import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import { WorkerMetrics, WorkerServiceInterface } from '../services/workerService';

// Define the interface for the component props
interface MetricsDashboardProps {
  workerService: WorkerServiceInterface;
}

export function MetricsDashboard({
  workerService
}: MetricsDashboardProps) {
  const [workerMetrics, setWorkerMetrics] = React.useState<WorkerMetrics>();
  const [apiError, setApiError] = React.useState('');

  const fetchWorkerMetrics = () => {
    workerService.
      getWorkerMetrics().
      then((result) => {
        result.map((data) => {
          setWorkerMetrics(data);
        }).mapErr((err) => {
          setApiError(`Error in getting worker metrics ${err.message}`);
        })
      })
  }

  React.useEffect(() => {
    fetchWorkerMetrics();
    const autoFetchMetrics = setInterval(() => {
      fetchWorkerMetrics();
    }, 3000);
    return () => clearInterval(autoFetchMetrics);
  }, [])

  return (
    <div>
      {apiError && <Alert severity='error' onClose={() => setApiError('')} >{apiError}</Alert>}
      <Grid container spacing={2}>
        {/* Queue Metrics */}
        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Queue Metrics
            </Typography>
            <Typography variant="body1">
              Tasks in Queue: {workerMetrics?.noOfTasksInQueue}
            </Typography>
            <Typography variant="body1">
              Jobs in Queue: {workerMetrics?.noOfJobsInQueue}
            </Typography>
          </Paper>
        </Grid>

        {/* Worker Metrics */}
        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Worker Metrics
            </Typography>
            <Typography variant="body1">
              Idle Workers: {workerMetrics?.noOfIdleProcesses}
            </Typography>
            <Typography variant="body1">
              Busy Workers: {workerMetrics?.noOfBusyProcesses}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default MetricsDashboard;
