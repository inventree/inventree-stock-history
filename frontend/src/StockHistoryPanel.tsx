// Import for type checking
import {
  checkPluginVersion,
  type InvenTreePluginContext,
  ModelType
} from '@inventreedb/ui';
import { Group, Stack } from '@mantine/core';
import { type DateValue, MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

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
      </Stack>
    </>
  );
}

// This is the function which is called by InvenTree to render the actual panel component
export function renderStockHistoryPanel(context: InvenTreePluginContext) {
  checkPluginVersion(context);
  return <StockHistoryPanel context={context} />;
}
