import express from "express";

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

const customers = [
  {
    id: "cus-001",
    name: "Ana Silva",
    email: "ana.silva@example.com"
  },
  {
    id: "cus-002",
    name: "Bruno Oliveira",
    email: "bruno.oliveira@example.com"
  },
  {
    id: "cus-003",
    name: "Carla Souza",
    email: "carla.souza@example.com"
  }
];

app.get("/", (req, res) => {
  res.json({
    service: "customer-service",
    status: "running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

app.get("/customers", (req, res) => {
  res.json({
    count: customers.length,
    customers
  });
});

app.get("/customers/:id", (req, res) => {
  const customer = customers.find((item) => item.id === req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found"
    });
  }

  res.json(customer);
});

app.listen(PORT, () => {
  console.log(`customer-service running on port ${PORT}`);
});