import { TextField } from '@mui/material';
import styled from 'styled-components';
import { UseCreateJobObject } from './create-job.hook';

export const FormContainer = styled.div`
  padding-top: 16px;

  div.MuiTextField-root {
    width: 100%;
  }
`;

interface CreateJobFormProps {
  useCreateJobObject: UseCreateJobObject;
}
const CreateJobForm = ({
  useCreateJobObject,
}: CreateJobFormProps) => {
  const { noOfFilesState, noOfEntriesPerFileState, jobLoadingState } = useCreateJobObject;

  return (
    <FormContainer>
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
    </FormContainer>
  );
};

export default CreateJobForm;