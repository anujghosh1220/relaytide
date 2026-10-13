import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Ticket } from '../../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { buildVolumeSeries, hasVolumeData, type VolumePoint } from '../../lib/metrics';

interface TicketVolumeChartProps {
  tickets: Ticket[];
  loading: boolean;
  days?: number;
}

const SERIES = [
  { key: 'created' as const, label: 'Created', color: '#3b82f6' },
  { key: 'resolved' as const, label: 'Resolved', color: '#22c55e' },
];

const CHART_HEIGHT = 260;

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
  payload?: VolumePoint;
}

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="min-w-36 rounded-lg border border-border bg-elevated px-3 py-2 text-xs shadow-xl shadow-black/40">
      {point && <p className="mb-1.5 font-medium text-foreground">{point.fullLabel}</p>}
      <div className="space-y-1">
        {SERIES.map((series) => {
          const item = payload.find((entry) => entry.dataKey === series.key);
          return (
            <div key={series.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: series.color }}
                />
                {series.label}
              </span>
              <span className="tabular font-medium text-foreground">{item?.value ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TicketVolumeChart = ({ tickets, loading, days = 14 }: TicketVolumeChartProps) => {
  const series = loading ? buildVolumeSeries([], days) : buildVolumeSeries(tickets, days);
  const hasData = hasVolumeData(series);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket throughput</CardTitle>
        <CardDescription>
          Tickets created and resolved per day over the last {days} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full" style={{ height: CHART_HEIGHT }} />
        ) : !hasData ? (
          <div
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-6 text-center"
            style={{ height: CHART_HEIGHT }}
          >
            <p className="text-sm font-medium text-foreground">Not enough history to chart yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This chart needs tickets created, answered or resolved inside the last {days} days.
              Create a ticket and record a first response to start building the trend.
            </p>
          </div>
        ) : (
          <>
            <div style={{ height: CHART_HEIGHT }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} accessibilityLayer>
                  <defs>
                    {SERIES.map((s) => (
                      <linearGradient key={s.key} id={`volume-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1c2634" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={12}
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <Tooltip
                    content={<VolumeTooltip />}
                    cursor={{ stroke: '#2a3a4e', strokeWidth: 1 }}
                  />
                  {SERIES.map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#volume-${s.key})`}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {SERIES.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-[2px]"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketVolumeChart;
