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
    name: 'noOfFiles',
    label: 'No. of Files'
  },
  {
    name: 'noOfEntriesPerFile',
    label: 'No. of entries/file'
  },
  {
    name: 'totalTasks',
    label: 'Total tasks(post job)'
  },
  {
    name: 'progress',
    label: 'Progress',
    options: {
      customBodyRender: (value, tableMeta, updatedValue) => {
        return `${Math.floor(Number(value))}%`;
      }
    },
  }
];