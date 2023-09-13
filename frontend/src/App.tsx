import './App.css';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {BaseTabs} from './components/base/tabs/tab';
import MetricsDashboard from './components/metrics';
import { JobsDashboard } from './components/jobs';
import { JobService } from './services/jobService';

import axios from 'axios';
import { WorkerService } from './services/workerService';
import { getSpacesUrl, Ports } from './utils/urls';

const apiBaseUrl = getSpacesUrl(Ports.Backend);

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
    <Box sx={{flexGrow: 1}}>
      <AppBar position='static'>
        <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DynamoFL File Processing
            </Typography>
          </Toolbar>
        </AppBar>
      <BaseTabs
        tabs={[
          {
            label: 'Workers and Jobs',
            children: (
              <JobsDashboard
                jobService={jobService}
                workerService={workerService}
              />    
            )
          },
          {
            label: 'Statistics',
            children: (
              <MetricsDashboard
                workerService={workerService}
              />    
            )
          },
          {
            label: 'Celery Flower',
            children: (
              <Box>
                <iframe src={getSpacesUrl(Ports.Flower)} width="100%" height="1000px">
                </iframe>
              </Box>
            )
          },
          {
            label: 'RabbitMQ Management',
            children: (
              <Box>
                <iframe src={getSpacesUrl(Ports.RabbitMQManagementUi)} width="100%" height="1000px">
                </iframe>
              </Box>
            )
          },          
        ]}
      />
    </Box>
  );
}

export default App;
