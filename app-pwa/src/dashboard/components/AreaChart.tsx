import type { DeviceTelemetry, TelemetryKey } from 'app-shared';
import { useMemo } from 'react';
import {
  AreaChart as Chart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const fmt = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' });

export default function AreaChart({
  className,
  data,
  dataKey,
  valueName,
}: AreaChartProps) {
  const parsedData = useMemo(
    () =>
      [...data].reverse().map((v) => ({
        createdAt: fmt.format(new Date(v.createdAt)),
        value: v[dataKey],
      })),
    [data, dataKey],
  );

  return (
    <Chart
      className={className}
      style={{
        width: '100%',
        maxWidth: '750px',
        height: '100%',
        maxHeight: '300px',
        aspectRatio: 2.5,
      }}
      responsive
      data={parsedData}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-pink-500)" />
      <XAxis dataKey="createdAt" stroke="var(--color-black)" />
      <YAxis width="auto" stroke="var(--color-black)" />
      <Tooltip
        cursor={{
          stroke: 'var(--color-black)',
        }}
        labelFormatter={(v) => `${v} Uhr`}
        contentStyle={{
          backgroundColor: 'var(--color-pink-400)',
          borderColor: 'var(--color-black)',
          borderRadius: '1rem',
          borderWidth: '2px',
        }}
        itemStyle={{
          fontWeight: 'bold',
        }}
        formatter={(v) => `${v}%`}
      />
      <Area
        type="monotone"
        name={valueName}
        dataKey="value"
        stroke="var(--color-black)"
        strokeWidth={2}
        fill="var(--color-pink-500)"
        dot={{
          fill: 'var(--color-black)',
        }}
        activeDot={{ r: 8, stroke: 'var(--color-black)' }}
      />
    </Chart>
  );
}

type AreaChartProps = Readonly<{
  data: DeviceTelemetry;
  dataKey: TelemetryKey;
  valueName: string;
}> &
  React.HTMLAttributes<HTMLDivElement>;
