import { useEffect, useRef, useCallback } from 'react';
import type { Order } from '../types';

type SSEEvent =
  | { type: 'connected' }
  | { type: 'new_order'; order: Order }
  | { type: 'order_update'; order: Order };

export function useSSE(
  onNewOrder: (order: Order) => void,
  onOrderUpdate: (order: Order) => void,
) {
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  onNewOrderRef.current = onNewOrder;
  onOrderUpdateRef.current = onOrderUpdate;

  const connect = useCallback(() => {
    const es = new EventSource('/api/orders/events');

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        if (data.type === 'new_order') {
          onNewOrderRef.current(data.order);
        } else if (data.type === 'order_update') {
          onOrderUpdateRef.current(data.order);
        }
      } catch { /* ignore */ }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    return es;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => es.close();
  }, [connect]);
}
