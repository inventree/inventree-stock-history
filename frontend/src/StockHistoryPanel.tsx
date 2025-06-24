// Import for type checking
import {
  ApiEndpoints,
  apiUrl,
  checkPluginVersion,
  type InvenTreePluginContext,
  ModelType
} from '@inventreedb/ui';
import { Alert, Button, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

  const historyQuery = useQuery(
    {
      enabled: !!partId,
      queryKey: ['stock-history', partId],
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      queryFn: async () => {
        return context.api
          ?.get(STOCKTAKE_URL, {
            params: {
              part: partId
              // TODO: Date range
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
    console.log('history data:');
    console.log(historyQuery.data);
  }, [historyQuery.data]);

  // Hello world - counter example
  const [counter, setCounter] = useState<number>(0);

  // Extract context information
  const instance: string = useMemo(() => {
    const data = context?.instance ?? {};
    return JSON.stringify(data, null, 2);
  }, [context.instance]);

  // Fetch API data from the example API endpoint
  // It will re-fetch when the partId changes
  const apiQuery = useQuery(
    {
      queryKey: ['apiData', partId],
      queryFn: async () => {
        const url = `/plugin/stock-history/example/`;

        return context.api
          .get(url)
          .then((response) => response.data)
          .catch(() => {});
      }
    },
    context.queryClient
  );

  // Custom form to edit the selected part
  const editPartForm = context.forms.edit({
    url: apiUrl(ApiEndpoints.part_list, partId),
    title: 'Edit Part',
    preFormContent: (
      <Alert title='Custom Plugin Form' color='blue'>
        This is a custom form launched from within a plugin!
      </Alert>
    ),
    fields: {
      name: {},
      description: {},
      category: {}
    },
    successMessage: null,
    onFormSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Part updated successfully!',
        color: 'green'
      });
    }
  });

  // Custom callback function example
  const openForm = useCallback(() => {
    editPartForm?.open();
  }, [editPartForm]);

  // Navigation functionality example
  const gotoDashboard = useCallback(() => {
    context.navigate('/home');
  }, [context]);

  return (
    <>
      {editPartForm.modal}
      <Stack gap='xs'>
        <Title c={context.theme.primaryColor} order={3}>
          Stock History
        </Title>
        <Text>This is a custom panel for the StockHistory plugin.</Text>
        <Group justify='apart' wrap='nowrap' gap='sm'>
          <Button color='blue' onClick={gotoDashboard}>
            Go to Dashboard
          </Button>
          {partId && (
            <Button color='green' onClick={openForm}>
              Edit Part
            </Button>
          )}
          <Button onClick={() => setCounter(counter + 1)}>
            Increment Counter
          </Button>
          <Text size='xl'>Counter: {counter}</Text>
        </Group>
        {instance ? (
          <Alert title='Instance Data' color='blue'>
            {instance}
          </Alert>
        ) : (
          <Alert title='No Instance' color='yellow'>
            No instance data available
          </Alert>
        )}
        {apiQuery.isFetched && apiQuery.data && (
          <Alert color='green' title='API Query Data'>
            {apiQuery.isFetching || apiQuery.isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <Stack gap='xs'>
                <Text>Part Count: {apiQuery.data.part_count}</Text>
                <Text>Today: {apiQuery.data.today}</Text>
                <Text>Random Text: {apiQuery.data.random_text}</Text>
                <Button
                  disabled={apiQuery.isFetching || apiQuery.isLoading}
                  onClick={() => apiQuery.refetch()}
                >
                  Reload Data
                </Button>
              </Stack>
            )}
          </Alert>
        )}
      </Stack>
    </>
  );
}

// This is the function which is called by InvenTree to render the actual panel component
export function renderStockHistoryPanel(context: InvenTreePluginContext) {
  checkPluginVersion(context);
  return <StockHistoryPanel context={context} />;
}
