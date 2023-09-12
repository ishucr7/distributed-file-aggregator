import { MUIDataTableColumn } from 'mui-datatables';

export const JobColumnsFactory = (
): MUIDataTableColumn[] => [
  {
    name: '_id',
    label: 'Job Id'
  },
  {
    name: 'status',
    label: 'Status'
  },
  {
    name: 'progress',
    label: 'Progress'
  }
];