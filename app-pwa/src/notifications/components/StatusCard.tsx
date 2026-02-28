import { Info, TriangleAlert } from 'lucide-react';
import { Card } from '../../common/ui-components';

export default function StatusCard({
  data,
  style = 'warning',
  icon = 'warning',
  size = 'small',
  className,
}: ErrorCardProps) {
  return (
    <Card
      className={`${style === 'info' ? 'bg-livid-700' : 'bg-pink-400'} flex items-start ${className}`}
      size={size}
    >
      {icon === 'info' ? (
        <Info strokeWidth={3} className="shrink-0 mt-1 mr-2" />
      ) : (
        <TriangleAlert strokeWidth={3} className="shrink-0 mt-1 mr-2" />
      )}
      <div>
        <p
          className={`${size === 'small' ? 'text-xl mb-2' : 'text-2xl mb-4'} font-bold`}
        >
          {data?.title || 'Schade Marmelade'}
        </p>
        <p>{data.message}</p>
      </div>
    </Card>
  );
}

type ErrorCardProps = Readonly<{
  data: {
    title?: string;
    message: string;
  };
  icon?: 'warning' | 'info';
  style?: 'warning' | 'info';
  size?: 'small' | 'large';
}> &
  React.HTMLAttributes<HTMLDivElement>;
