import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
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
import styled from 'styled-components';
import { BaseModal } from '../base/modal/modal';


export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  button.MuiButton-root {
    margin: 8px;
  }
`;

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
  const [jobs, setJobs] = useState<Job[]>([]);

  const jobModalState = useState(false);

  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const useCreateJobObject = useCreateJob();
  const { jobLoadingState, noOfFilesState, resetCreateJobForm, noOfEntriesPerFileState } = useCreateJobObject;

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


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 1, width: "50%", margin: "auto" }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1, width: "50%", margin: "auto" }}>
        <TextField
          label="Number of workers"
          type="number"
          value={noOfWorkers}
          onChange={(e) => setNumberOfWorkers(e.target.value)}
        />
        <ButtonContainer>
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={updatePoolSize}
          >
            {loading ? <CircularProgress size={24} /> : "Update Workers"}
          </Button>

        </ButtonContainer>
        {apiSuccess && <Alert severity='success' onClose={() => { setApiSuccess('') }}>{apiSuccess}</Alert>}
        {apiError && <Alert severity='error' onClose={() => { setApiError('') }}>{apiError}.</Alert>}
      </Box>
      <div>
        <BaseModal
          dialogButtonText={'Create Job'}
          modalState={jobModalState}
          handlePrimaryClick={ async () => {
            createJob();
          }}
          onModalClose={()=> {
            jobLoadingState[1](false);
            jobModalState[1](false);
            resetCreateJobForm();
          }}
          primaryButtonText={'Submit Job'}
        >
          <CreateJobForm
            useCreateJobObject={useCreateJobObject}
          />
          {jobLoadingState[0] && (
            <LinearProgress />
          )}
        </BaseModal>
        {apiError && <Alert severity="error">{apiError}</Alert>}
        {apiSuccess && <Alert severity="success">{apiSuccess}</Alert>}
          <MUIDataTable
            title={"Jobs"}
            data={jobs}
            columns={JobColumnsFactory()}
            options={{
              download: false,
              filter: false,
              print: false,
              viewColumns: false,
              selectableRowsHideCheckboxes: true
            }}
          />
      </div>

    </Box>
  );
};
