import { useState, useEffect } from 'react';
import { mockHolidays } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Table from '../../components/shared/Table';
import { getAllHolidays, HolidayResponse } from "../../service/holidays.service";
import { Loader2 } from 'lucide-react';

export default function MyHolidays() {
  const [holidays, setHolidays] = useState<HolidayResponse[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── GET: Fetch all holidays from API ──────────────────────────────────────
  useEffect(() => {
    const fetchHolidays = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const data = await getAllHolidays();
        setHolidays(data);
      } catch (err: any) {
        console.error('Failed to fetch holidays:', err.message);
        setError('Failed to load holidays.');
        // Fallback to mock data if API fails
        setHolidays(
          mockHolidays.map((h, i) => ({
            _id: String(i),
            name: h.name,
            date: h.date,
            type: h.type as HolidayResponse['type'],
          }))
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchHolidays();
  }, []);

  const columns = [
    {
      header: 'Holiday',
      render: (row: HolidayResponse) => (
        <span className="font-semibold text-slate-900">{row.name}</span>
      ),
    },
    {
      header: 'Date',
      render: (row: HolidayResponse) => formatDate(row.date),
    },
    {
      header: 'Day',
      render: (row: HolidayResponse) =>
        new Date(row.date).toLocaleDateString('en-IN', { weekday: 'long' }),
    },
    {
      header: 'Type',
      render: (row: HolidayResponse) => <Badge status={row.type} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Holiday Calendar</h1>
        <p className="page-subtitle">
          {isFetching ? 'Loading...' : `${holidays.length} holidays this year`}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error} Showing offline data.
        </div>
      )}

      {/* Loading State */}
      {isFetching ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading holidays...
        </div>
      ) : (
        <Table columns={columns} data={holidays} rowsPerPage={5} />
      )}
    </div>
  );
}