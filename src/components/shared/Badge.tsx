import { getStatusColor } from '../../utils/helpers';

interface BadgeProps {
  status: string;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {label || status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
}
