const express = require("express");
const router = express.Router();
const creds = require("../config");
const axios = require("axios");
router.get("/nvp", (req, res) => {
  res.render("nvp");
});

router.post("/set_ec", (req, res) => {
  console.log("reached");
  let query = {
    USER: creds.nvpCreds.user,
    PWD: creds.nvpCreds.pwd,
    SIGNATURE: creds.nvpCreds.signature,
    METHOD: "SetExpressCheckout",
    PAYMENTREQUEST_0_AMT: "1.00",
    RETURNURL: "https://www.paypal.com/checkoutnow/error",
    CANCELURL: "https://www.paypal.com/checkoutnow/error",
    SOLUTIONTYPE: "Sole",
    LANDINGPAGE: "Login",
    VERSION: "204.0",
    PAYMENTACTION: "Sale"
  };

  let headers = {
    "X-PAYPAL-SECURITY-USERID": creds.nvpCreds.user,
    "X-PAYPAL-SECURITY-PASSWORD": creds.nvpCreds.pwd,
    "X-PAYPAL-SECURITY-SIGNATURE": creds.nvpCreds.signature,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  let buildQueryString = query => {
    let queryString = "";
    for (var i in query) {
      queryString += i + "=" + query[i] + "&";
    }

    return queryString;
  };

  const getToken = () => {
    axios
      .post("https://api-3t.sandbox.paypal.com/nvp", buildQueryString(query), {
        headers: headers
      })
      .then(response => {
        let decoded = decodeURIComponent(response.data);

        let token = decoded.match(/EC-\w+/)[0];

        res.send({ token: token });
      });
  };

  getToken();
});

router.post("/do_ec", (req, res) => {
  let token = req.body.orderID;
  let payerID = req.body.payerID;

  let query = {
    USER: creds.nvpCreds.user,
    PWD: creds.nvpCreds.pwd,
    SIGNATURE: creds.nvpCreds.signature,
    METHOD: "DoExpressCheckoutPayment",
    TOKEN: token,
    PAYERID: payerID,
    PAYMENTACTION: "Sale",
    PAYMENTREQUEST_0_AMT: "1.00",
    VERSION: "204.0"
  };

  let headers = {
    "X-PAYPAL-SECURITY-USERID": creds.nvpCreds.user,
    "X-PAYPAL-SECURITY-PASSWORD": creds.nvpCreds.pwd,
    "X-PAYPAL-SECURITY-SIGNATURE": creds.nvpCreds.signature,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  let buildQueryString = query => {
    let queryString = "";
    for (var i in query) {
      queryString += i + "=" + query[i] + "&";
    }

    return queryString;
  };

  const getToken = async () => {
    await axios
      .post("https://api-3t.sandbox.paypal.com/nvp", buildQueryString(query), {
        headers: headers
      })
      .then(response => {
        let decoded = decodeURIComponent(response.data);
        let arr = decoded.split("&");

        res.send({ arr: arr });
      });
  };

  getToken();
});

module.exports = router;
