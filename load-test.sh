#!/bin/bash

URL="http://development-connection-demo.openchoreoapis.localhost:19080/order-service-api/orders"
DURATION_SECONDS=180
CONCURRENCY=30

echo "Starting load test..."
echo "URL: $URL"
echo "Duration: $DURATION_SECONDS seconds"
echo "Concurrency: $CONCURRENCY"

end=$((SECONDS + DURATION_SECONDS))

while [ $SECONDS -lt $end ]; do
  for i in $(seq 1 $CONCURRENCY); do
    curl -s "$URL" > /dev/null &
  done

  wait
  echo "Load batch completed at $(date)"
done

echo "Load test finished."
