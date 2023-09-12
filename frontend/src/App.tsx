import React from 'react';
import logo from './logo.svg';
import './App.css';
import Box from '@mui/material/Box';
import MetricsComponent from './components/metrics';
import { JobsDashboard } from './components/jobs';
import { JobService } from './services/jobService';
import axios, { AxiosHeaders } from 'axios';
import { WorkerService } from './services/workerService';

// const apiBaseUrl = 'http://localhost:3000'
const apiBaseUrl = 'https://expert-goldfish-6vvwrpj7p9whg4x-3000.app.github.dev';

function App() {
  const endpoint = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
  });
  const jobService = new JobService(endpoint);
  const workerService = new WorkerService(endpoint);

  const queueMetrics = {
    tasksInQueue: 10,
    jobsInQueue: 5,
  };

  const workerMetrics = {
    idleWorkers: 3,
    busyWorkers: 7,
  };
  return (
    <Box>
        <JobsDashboard
          jobService={jobService}
          workerService={workerService}
        />
    </Box>
  );
}

export default App;
