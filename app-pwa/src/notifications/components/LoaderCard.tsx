import { LoaderCircle } from 'lucide-react';
import { Card } from '../../common/ui-components';

export default function LoaderCard({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={`absolute top-0 left-0 w-full h-full flex justify-center items-center z-100 text-olive-700 ${className}`}
    >
      <LoaderCircle className="animate-spin text-inherit" size={65} />
    </Card>
  );
}
