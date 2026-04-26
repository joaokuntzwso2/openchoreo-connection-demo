import express from "express";

const app = express();

const PORT = process.env.PORT || 9090;

const CUSTOMER_SERVICE_URL =
  process.env.CUSTOMER_SERVICE_URL || "http://localhost:8080";

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
    const customerResponse = await fetch(`${CUSTOMER_SERVICE_URL}/customers`);

    if (!customerResponse.ok) {
      return res.status(502).json({
        error: "Failed to call customer-service",
        status: customerResponse.status
      });
    }

    const customerData = await customerResponse.json();

    const enrichedOrders = orders.map((order) => {
      const customer = customerData.customers.find(
        (item) => item.id === order.customerId
      );

      return {
        ...order,
        customer: customer || null
      };
    });

    res.json({
      service: "order-service",
      dependency: "customer-service",
      orders: enrichedOrders
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not connect to customer-service",
      customerServiceUrl: CUSTOMER_SERVICE_URL,
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
    const customerResponse = await fetch(
      `${CUSTOMER_SERVICE_URL}/customers/${order.customerId}`
    );

    const customer = customerResponse.ok
      ? await customerResponse.json()
      : null;

    res.json({
      ...order,
      customer
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not connect to customer-service",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`order-service running on port ${PORT}`);
  console.log(`Using customer-service at ${CUSTOMER_SERVICE_URL}`);
});