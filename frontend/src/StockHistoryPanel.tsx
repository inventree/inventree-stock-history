// Import for type checking
import {
  checkPluginVersion,
  type InvenTreePluginContext,
  ModelType
} from '@inventreedb/ui';
import { type ChartTooltipProps, LineChart } from '@mantine/charts';
import { Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { type DateValue, MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

function StockHistoryTooltip({ label, payload }: Readonly<ChartTooltipProps>) {
  const formattedLabel: string = useMemo(() => {
    if (label && typeof label === 'number') {
      return dayjs(label).format('YYYY-MM-DD') ?? label;
    } else if (!!label) {
      return label.toString();
    } else {
      return '';
    }
  }, [label]);

  if (!payload) {
    return null;
  }

  const quantity = payload.find((item) => item.name == 'quantity');
  const value_min = payload.find((item) => item.name == 'value_min');
  const value_max = payload.find((item) => item.name == 'value_max');

  // TODO: Better formatting of "price range"

  return (
    <Paper px='md' py='sm' withBorder shadow='md' radius='md'>
      <Text key='title'>{formattedLabel}</Text>
      <Divider />
      <Text key='quantity' fz='sm'>
        {`Quantity`} : {quantity?.value}
      </Text>
      <Text key='values' fz='sm'>
        {`Value`} : {value_min?.value} - {value_max?.value}
      </Text>
    </Paper>
  );
}

function StockHistoryChart({
  entries,
  minDate,
  maxDate
}: {
  entries: any[];
  minDate: Date;
  maxDate: Date;
}) {
  const chartSeries: any[] = useMemo(() => {
    return [
      {
        name: 'quantity',
        label: 'Quantity',
        color: 'blue.6',
        yAxisId: 'left'
      },
      {
        name: 'value_min',
        label: `Minimum Value`,
        color: 'yellow.6',
        yAxisId: 'right'
      },
      {
        name: 'value_max',
        label: `Maximum Value`,
        color: 'teal.6',
        yAxisId: 'right'
      }
    ];
  }, [entries]);

  const chartLimits: number[] = useMemo(() => {
    return [minDate.valueOf(), maxDate.valueOf()];
  }, [minDate, maxDate]);

  const chartData: any[] = useMemo(() => {
    return entries.map((entry) => {
      return {
        ...entry,
        date: new Date(entry.date).valueOf(),
        value_min: Number.parseFloat(entry.cost_min),
        value_max: Number.parseFloat(entry.cost_max)
      };
    });
  }, [entries]);

  return (
    <LineChart
      h={500}
      data={chartData}
      dataKey='date'
      withLegend
      withYAxis
      rightYAxisLabel='Stock Value'
      yAxisLabel='Stock Quantity'
      xAxisLabel='Date'
      xAxisProps={{
        domain: chartLimits,
        scale: 'time',
        type: 'number',
        tickFormatter: (value: number) => {
          return dayjs(value).format('YYYY-MM-DD');
        }
      }}
      yAxisProps={{
        allowDataOverflow: false
      }}
      rightYAxisProps={{
        allowDataOverflow: false
      }}
      tooltipProps={{
        content: ({ label, payload }) => (
          <StockHistoryTooltip label={label} payload={payload} />
        )
      }}
      series={chartSeries}
    />
  );
}

/**
 * Render a custom panel with the provided context.
 * Refer to the InvenTree documentation for the context interface
 * https://docs.inventree.org/en/latest/plugins/mixins/ui/#plugin-context
 */
function StockHistoryPanel({ context }: { context: InvenTreePluginContext }) {
  const partId = useMemo(() => {
    return context.model == ModelType.part ? context.id || null : null;
  }, [context.model, context.id]);

  const STOCKTAKE_URL: string = '/plugin/stock-history/history/';

  // Starting date for the order history
  const [startDate, setStartDate] = useState<Date>(
    dayjs().subtract(1, 'year').toDate()
  );

  // Ending date for the order history
  const [endDate, setEndDate] = useState<Date>(
    dayjs().add(1, 'month').toDate()
  );

  const historyQuery = useQuery(
    {
      enabled: !!partId && !!startDate && !!endDate,
      queryKey: ['stock-history', partId, startDate, endDate],
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      queryFn: async () => {
        return context.api
          ?.get(STOCKTAKE_URL, {
            params: {
              part: partId,
              date_after: dayjs(startDate).format('YYYY-MM-DD'),
              date_before: dayjs(endDate).format('YYYY-MM-DD')
            }
          })
          .then((response: any) => response.data)
          .catch(() => {
            return [];
          });
      }
    },
    context.queryClient
  );

  useEffect(() => {
    console.log(historyQuery.data);
  }, [historyQuery.data]);

  return (
    <>
      <Paper withBorder p='sm' m='sm'>
        <Stack gap='xs'>
          <Group gap='xs' justify='space-apart' grow>
            <Group gap='xs'>
              <MonthPickerInput
                value={startDate}
                label={`Start Date`}
                onChange={(value: DateValue) => {
                  if (value && value < endDate) {
                    setStartDate(value);
                  }
                }}
              />
              <MonthPickerInput
                value={endDate}
                label={`End Date`}
                onChange={(value: DateValue) => {
                  if (value && value > startDate) {
                    setEndDate(value);
                  }
                }}
              />
            </Group>
          </Group>
          <StockHistoryChart
            minDate={startDate}
            maxDate={endDate}
            entries={historyQuery.data ?? []}
          />
        </Stack>
      </Paper>
    </>
  );
}

// This is the function which is called by InvenTree to render the actual panel component
export function renderStockHistoryPanel(context: InvenTreePluginContext) {
  checkPluginVersion(context);
  return <StockHistoryPanel context={context} />;
}
