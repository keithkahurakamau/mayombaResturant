const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Path to the JSON file storing orders
const ordersFilePath = path.join(__dirname, 'data', 'db.json');

// Helper function to read orders from file
function readOrders() {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to write orders to file
function writeOrders(orders) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

// GET /orders - return all orders
app.get('/orders', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// POST /orders - add a new order
app.post('/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.phone || !newOrder.items) {
    return res.status(400).json({ error: 'Order must include phone and items' });
  }

  const orders = readOrders();
  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json({ message: 'Order added successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
