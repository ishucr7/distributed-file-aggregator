import React from 'react';
import { StringStateObject, BooleanStateObject } from '../../../types/generic';

export interface UseCreateJobObject {
  noOfFilesState: StringStateObject;
  noOfEntriesPerFileState: StringStateObject;
  jobLoadingState: BooleanStateObject;
  resetCreateJobForm: () => void;
}

const useCreateJob = (): UseCreateJobObject => {
  const noOfFilesState = React.useState('');
  const noOfEntriesPerFileState = React.useState('');
  const jobLoadingState = React.useState(false);

  const resetCreateJobForm = () => {
    noOfFilesState[1]('');
    noOfEntriesPerFileState[1]('');
    jobLoadingState[1](false);
  };

  return {
    noOfFilesState,
    noOfEntriesPerFileState,
    jobLoadingState,
    resetCreateJobForm,
  };
};

export default useCreateJob;
