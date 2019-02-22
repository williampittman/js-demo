const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
const axios = require("axios");
const creds = require("../config");

paypal.configure({
  mode: "sandbox",
  client_id: creds.restCreds.client_id,
  client_secret: creds.restCreds.client_secret
});

router.get("/payments", (req, res) => {
  res.render("payments");
});

router.post("/create_payment", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "https://www.paypal.com/checkoutnow/error",
      cancel_url: "https://www.paypal.com/checkoutnow/error"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: "1.00",
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: "1.00"
        },
        description: "This is the payment description."
      }
    ]
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.send({ error: error });
    } else {
      let token;
      for (let link of payment.links) {
        if (link.rel === "approval_url") {
          token = link.href.match(/EC-\w+/)[0];
        }
      }
      res.send({ token: token });
    }
  });
});

router.post("/execute_payment", (req, res) => {
  const payerID = req.body.payerID;
  const paymentID = req.body.paymentID;

  const execute_payment_json = {
    payer_id: payerID
  };

  paypal.payment.execute(paymentID, execute_payment_json, (error, payment) => {
    if (error) {
      res.send({ error });
    } else {
      res.send({ payment });
    }
  });
});

module.exports = router;
