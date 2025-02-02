const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const receipts = {};

function calculatePoints(receipt) {
  let points = 0;

  points += (receipt.retailer.match(/[a-zA-Z0-9]/g) || []).length;

  if (receipt.total.endsWith(".00")) {
    points += 50;
  }

  if ((parseFloat(receipt.total) * 100) % 25 === 0) {
    points += 25;
  }

  points += Math.floor(receipt.items.length / 2) * 5;

  for (const item of receipt.items) {
    const trimmedDescription = item.shortDescription.trim();
    if (trimmedDescription.length % 3 === 0) {
      points += Math.ceil(parseFloat(item.price) * 0.2);
    }
  }

  const day = parseInt(receipt.purchaseDate.split("-")[2], 10);
  if (day % 2 === 1) {
    points += 6;
  }

  const [hours, minutes] = receipt.purchaseTime.split(":").map(Number);
  if (hours === 14 || (hours === 15 && minutes >= 0)) {
    points += 10;
  }

  return points;
}

app.post("/receipts/process", function (req, res) {
  const points = calculatePoints(req.body);
  const id = uuidv4();
  receipts[id] = { ...req.body, points };
  res.json({ id });
});

app.get("/receipts/:id/points", function (req, res) {
  res.json({ points: receipts[req.params.id].points || 0 });
});

app.listen(5000, function () {
  console.log("Server is running on port 5000");
});
