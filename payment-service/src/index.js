import express from "express";

const app = express();
const PORT = process.env.PORT || 7070;

app.use(express.json());

const payments = [
  {
    orderId: "ord-001",
    status: "APPROVED",
    method: "Credit Card",
    amount: 4500
  },
  {
    orderId: "ord-002",
    status: "APPROVED",
    method: "PIX",
    amount: 1200
  },
  {
    orderId: "ord-003",
    status: "PENDING",
    method: "Boleto",
    amount: 300
  }
];

app.get("/", (req, res) => {
  res.json({
    service: "payment-service",
    status: "running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

app.get("/payments", (req, res) => {
  res.json({
    count: payments.length,
    payments
  });
});

app.get("/payments/:orderId", (req, res) => {
  const payment = payments.find((item) => item.orderId === req.params.orderId);

  if (!payment) {
    return res.status(404).json({
      error: "Payment not found"
    });
  }

  res.json(payment);
});

app.listen(PORT, () => {
  console.log(`payment-service running on port ${PORT}`);
});