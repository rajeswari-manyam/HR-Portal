import { mockHolidays } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Table from '../../components/shared/Table'; // import reusable Table

export default function MyHolidays() {
  const columns = [
    {
      header: 'Holiday',
      render: (row: typeof mockHolidays[0]) => <span className="font-semibold text-slate-900">{row.name}</span>,
    },
    {
      header: 'Date',
      render: (row: typeof mockHolidays[0]) => formatDate(row.date),
    },
    {
      header: 'Day',
      render: (row: typeof mockHolidays[0]) =>
        new Date(row.date).toLocaleDateString('en-IN', { weekday: 'long' }),
    },
    {
      header: 'Type',
      render: (row: typeof mockHolidays[0]) => <Badge status={row.type} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Holiday Calendar</h1>
        <p className="page-subtitle">{mockHolidays.length} holidays this year</p>
      </div>

      <Table columns={columns} data={mockHolidays} rowsPerPage={5} />
    </div>
  );
}