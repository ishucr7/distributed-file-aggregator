import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

// Define the interface for the props
interface MetricsProps {
  queueMetrics: {
    tasksInQueue: number;
    jobsInQueue: number;
  };
  workerMetrics: {
    idleWorkers: number;
    busyWorkers: number;
  };
}

const MetricsComponent: React.FC<MetricsProps> = ({ queueMetrics, workerMetrics }) => {
  return (
    <div>
      <Grid container spacing={2}>
        {/* Queue Metrics */}
        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Queue Metrics
            </Typography>
            <Typography variant="body1">
              Tasks in Queue: {queueMetrics.tasksInQueue}
            </Typography>
            <Typography variant="body1">
              Jobs in Queue: {queueMetrics.jobsInQueue}
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
              Idle Workers: {workerMetrics.idleWorkers}
            </Typography>
            <Typography variant="body1">
              Busy Workers: {workerMetrics.busyWorkers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default MetricsComponent;
