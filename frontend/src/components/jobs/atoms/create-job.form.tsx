import { TextField } from '@mui/material';
import Box from '@mui/material/Box';

import { UseCreateJobObject } from './create-job.hook';

interface CreateJobFormProps {
  useCreateJobObject: UseCreateJobObject;
}
const CreateJobForm = ({
  useCreateJobObject,
}: CreateJobFormProps) => {
  const { noOfFilesState, noOfEntriesPerFileState, jobLoadingState } = useCreateJobObject;

  return (
    <Box>
        <TextField
            disabled={jobLoadingState[0]}
            label={'No of files'}
            required
            type={`text`}
            value={noOfFilesState[0]}
            onChange={(e) => noOfFilesState[1](e.target.value)}
        />
        <TextField
            disabled={jobLoadingState[0]}
            label={'Name of entries per file'}
            required
            type={`text`}
            value={noOfEntriesPerFileState[0]}
            onChange={(e) => noOfEntriesPerFileState[1](e.target.value)}
        />
    </Box>
  );
};

export default CreateJobForm;