import express from "express";

const app = express();

const PORT = process.env.PORT || 9090;

function getServiceUrl(prefix, fallback) {
  const directUrl = process.env[`${prefix}_URL`];

  if (directUrl) {
    return directUrl;
  }

  const host = process.env[`${prefix}_HOST`];
  const port = process.env[`${prefix}_PORT`];

  if (host && port) {
    return `http://${host}:${port}`;
  }

  return fallback;
}

const CUSTOMER_SERVICE_URL = getServiceUrl(
  "CUSTOMER_SERVICE",
  "http://localhost:8080"
);

const PAYMENT_SERVICE_URL = getServiceUrl(
  "PAYMENT_SERVICE",
  "http://localhost:7070"
);

app.use(express.json());

const orders = [
  {
    id: "ord-001",
    customerId: "cus-001",
    product: "Notebook",
    total: 4500
  },
  {
    id: "ord-002",
    customerId: "cus-002",
    product: "Monitor",
    total: 1200
  },
  {
    id: "ord-003",
    customerId: "cus-003",
    product: "Teclado",
    total: 300
  }
];

app.get("/", (req, res) => {
  res.json({
    service: "order-service",
    status: "running",
    customerServiceUrl: CUSTOMER_SERVICE_URL,
    paymentServiceUrl: PAYMENT_SERVICE_URL,
    demoMode: process.env.DEMO_MODE || "NOT_SET"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

app.get("/orders", async (req, res) => {
  try {
    const [customerResponse, paymentResponse] = await Promise.all([
      fetch(`${CUSTOMER_SERVICE_URL}/customers`),
      fetch(`${PAYMENT_SERVICE_URL}/payments`)
    ]);

    if (!customerResponse.ok) {
      return res.status(502).json({
        error: "Failed to call customer-service",
        status: customerResponse.status
      });
    }

    if (!paymentResponse.ok) {
      return res.status(502).json({
        error: "Failed to call payment-service",
        status: paymentResponse.status
      });
    }

    const customerData = await customerResponse.json();
    const paymentData = await paymentResponse.json();

    const enrichedOrders = orders.map((order) => {
      const customer = customerData.customers.find(
        (item) => item.id === order.customerId
      );

      const payment = paymentData.payments.find(
        (item) => item.orderId === order.id
      );

      return {
        ...order,
        customer: customer || null,
        payment: payment || null
      };
    });

    res.json({
      service: "order-service",
      dependencies: ["customer-service", "payment-service"],
      orders: enrichedOrders
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not connect to dependencies",
      customerServiceUrl: CUSTOMER_SERVICE_URL,
      paymentServiceUrl: PAYMENT_SERVICE_URL,
      details: error.message
    });
  }
});

app.get("/orders/:id", async (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      error: "Order not found"
    });
  }

  try {
    const [customerResponse, paymentResponse] = await Promise.all([
      fetch(`${CUSTOMER_SERVICE_URL}/customers/${order.customerId}`),
      fetch(`${PAYMENT_SERVICE_URL}/payments/${order.id}`)
    ]);

    const customer = customerResponse.ok
      ? await customerResponse.json()
      : null;

    const payment = paymentResponse.ok
      ? await paymentResponse.json()
      : null;

    res.json({
      ...order,
      customer,
      payment
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not connect to dependencies",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`order-service running on port ${PORT}`);
  console.log(`Using customer-service at ${CUSTOMER_SERVICE_URL}`);
  console.log(`Using payment-service at ${PAYMENT_SERVICE_URL}`);
});
