const express = require("express");
const router = express.Router();
const axios = require("axios");
const creds = require("../config");
const base64 = require("base-64");

const getCreds = () => {
  let client_id = creds.restCreds.client_id;
  let client_secret = creds.restCreds.client_secret;
  let stringToEncode = `${client_id}:${client_secret}`;
  let encodedString = base64.encode(stringToEncode);
  return encodedString;
};

//RENDERS BA PAGE
router.get("/ba", (req, res) => {
  res.render("ba");
});

//POST
//CREATE BILLING AGREEMENT TOKEN
//GENERATES CLIENT TOKEN, THEN SUBMITS POST TO GET BA TOKEN
router.post("/create_ba_token", (req, res) => {
  const headers = {
    Authorization: `Basic ${getCreds()}`
  };

  const getToken = () => {
    return new Promise(resolve => {
      axios
        .post(
          "https://api.sandbox.paypal.com/v1/oauth2/token",
          "grant_type=client_credentials",
          {
            headers: headers
          }
        )
        .then(response => resolve(response.data.access_token))
        .catch(err => console.error(err));
    });
  };

  const billing_token_json = {
    description: "Billing Agreement",
    shipping_address: {
      line1: "1350 North First Street",
      city: "San Jose",
      state: "CA",
      postal_code: "95112",
      country_code: "US",
      recipient_name: "John Doe"
    },
    payer: {
      payment_method: "PAYPAL"
    },
    plan: {
      type: "MERCHANT_INITIATED_BILLING",
      merchant_preferences: {
        return_url: "https://www.paypal.com/checkoutnow/error",
        cancel_url: "https://www.paypal.com/checkoutnow/error",
        accepted_pymt_type: "INSTANT",
        skip_shipping_address: false,
        immutable_shipping_address: true
      }
    }
  };

  const createBillingToken = token => {
    return new Promise(resolve => {
      axios
        .post(
          "https://api.sandbox.paypal.com/v1/billing-agreements/agreement-tokens",
          billing_token_json,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(response =>
          resolve(res.send({ billingToken: response.data.token_id }))
        );
    });
  };

  const createToken = async () => {
    try {
      const token = await getToken();
      const baToken = await createBillingToken(token);
      return baToken;
    } catch (e) {
      console.error(e);
    }
  };

  createToken();
});

//POST
//RECEIVES BILLINGTOKEN FROM CLIENT
//CREATES BILLING AGREEMENT
router.post("/finalize_ba", (req, res) => {
  const billingToken = req.body.billingToken;
  console.log(billingToken);
  const create_agreement_json = {
    token_id: billingToken
  };
  console.log(create_agreement_json);
  const headers = {
    Authorization: `Basic ${getCreds()}`
  };

  //FUNCTION TO CREATE CLIENT TOKEN
  const getToken = () => {
    return new Promise(resolve => {
      axios
        .post(
          "https://api.sandbox.paypal.com/v1/oauth2/token",
          "grant_type=client_credentials",
          {
            headers: headers
          }
        )
        .then(response => resolve(response.data.access_token))
        .catch(err => console.error(err));
    });
  };

  //SENDS BA TOKEN TO CREATE BA
  const sendBaToken = token => {
    return new Promise(resolve => {
      axios
        .post(
          "https://api.sandbox.paypal.com/v1/billing-agreements/agreements",
          { token_id: billingToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(response =>
          resolve(res.send({ billingAgreement: response.data }))
        );
    });
  };

  const createBillingAgreement = async () => {
    try {
      const token = await getToken();
      const createBA = await sendBaToken(token);
      return createBA;
    } catch (e) {
      console.log(e);
    }
  };

  createBillingAgreement();
});

module.exports = router;
