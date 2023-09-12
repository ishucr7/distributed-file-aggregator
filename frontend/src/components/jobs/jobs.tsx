import React, { useState, useEffect } from 'react';
import { Button, TextField, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Job, JobServiceInterface } from '../../services/jobService';
import { WorkerServiceInterface } from '../../services/workerService';

import useCreateJob from './atoms/create-job.hook';
import CreateJobForm from './atoms/create-job.form';
import { JobColumnsFactory } from './atoms/columns';

import MUIDataTable from 'mui-datatables';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// Define the interface for the component props
interface JobDashboardProps {
    jobService: JobServiceInterface;
    workerService: WorkerServiceInterface;
}

export function JobsDashboard({ 
    jobService,
    workerService
 }: JobDashboardProps) {
  const [loading, setLoading] = React.useState(true);

  const [noOfWorkers, setNumberOfWorkers] = useState('');
  const [editValue, setEditValue] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

  const [isAddModalOpen, setIsAddJobModalOpen] = useState(false);

  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const useCreateJobObject = useCreateJob();
  const {jobLoadingState, noOfFilesState, resetCreateJobForm, noOfEntriesPerFileState } = useCreateJobObject;

  const getWorker = () => {
    workerService
      .getWorker()
      .then((result) => {
        result
          .map((data) => {
            setNumberOfWorkers(`${data.stats.pool.processes.length}`);
          })
          .mapErr((err: { message: string }) => {
            setApiError(`${'Error: Getting Worker process count'} : ${err.message}`);
          });
      })
  };

  const fetchJobs = () => {
    jobService
      .getJobs()
      .then((result) => {
        result
          .map((data) => {
            const listItems = data.map((item) => ({
              ...item,
            }));
            setJobs(listItems);
            setApiSuccess(`Successfully got the job`);
          })
          .mapErr((err: { message: string }) => {
            setApiError(`${'Error: Getting Jobs'} : ${err.message}`);
          });
      })
  };

  const createJob = () => {
    jobLoadingState[1](true);
    jobService
      .createJob({
        noOfFiles: Number(noOfFilesState[0]),
        noOfEntriesPerfile: Number(noOfEntriesPerFileState[0])
      })
      .then((result) => {
        result
          .map((data) => {
            fetchJobs();
            setApiSuccess(`Successfully created Job`);
          })
          .mapErr((err: { message: string }) => {
            setApiError(`${'Error: Creating Job'} : ${err.message}`);
          });
      })
      .finally(() => {
        setLoading(false);
        jobLoadingState[1](false);
      });
  };

  const updatePoolSize = () => {
    workerService
      .modifyPoolSize({
        noOfWorkers: Number(noOfWorkers)
      })
      .then((result) => {
        result
          .map((data) => {
            setApiSuccess(`Successfully modified workers: ${data.message}`);
          })
          .mapErr((err: { message: string }) => {
            setApiError(`${'Error: Modifying workers'} : ${err.message}`);
          });
      })
      .finally(() => {
        setLoading(false);
      });
  };


  useEffect(() => {
    Promise.all([fetchJobs(), getWorker()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleAddClick = () => {
    resetCreateJobForm();
    setIsAddJobModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddJobModalOpen(false);
  };

  const addModal = (
    <Modal open={isAddModalOpen} onClose={handleAddModalClose}>
      <Paper style={{ padding: '20px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <CreateJobForm
          useCreateJobObject={useCreateJobObject}
        />
        {jobLoadingState[0] && (
          <LinearProgress />
        )}
      </Paper>
    </Modal>
  );

  const columns = [
    'Job ID',
    'Status',
    'Progress',
    'Output File Path',
  ];

  const options = {
    filterType: 'checkbox',
    responsive: 'vertical',
  };

  return (
    <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 1, width: "50%", margin: "auto"}}>
            <TextField 
                label="Number of workers" 
                type="number" 
                value={noOfWorkers} 
                onChange={(e) => setNumberOfWorkers(e.target.value)}
            />
            <Button 
                variant="contained" 
                color="primary"
                disabled={loading} 
                onClick={updatePoolSize}
              >
                {loading ? <CircularProgress size={24} /> : "Spawn Workers"}
            </Button>
            {apiSuccess && <Alert severity='success' onClose={() => {setApiSuccess('')}}>{apiSuccess}</Alert>}
            {apiError && <Alert severity='error' onClose={() => {setApiError('')}}>{apiError}.</Alert>}
        </Box>
      <div>
        <Typography variant="h5" gutterBottom>
          Jobs Table
          <Button variant="contained" color="primary" onClick={handleAddClick}>
            Add Job
          </Button>
        </Typography>
        {apiError && <Alert severity="error">{apiError}</Alert>}
        {apiSuccess && <Alert severity="success">{apiSuccess}</Alert>}
        {addModal}
        <TableContainer component={Paper}>
          <MUIDataTable
            title={"Jobs"}
            data={jobs}
            columns={JobColumnsFactory()}
            options={{}}
          />
        </TableContainer>
      </div>

    </Box>
  );
};
