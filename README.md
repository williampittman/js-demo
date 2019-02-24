# js-demo

This repo contains working tests for the following integration patterns:

- upgrading NVP/SOAP Express Checkout integration to use the JavaScript SDK
- upgrading Server Side /v1/payments integration to use the JavaScript SDK
- upgrading Billing Agreement integrations with /v1/billing-agreements/agreement-tokens to use the JavaScript SDK

# requirements

npm and node.js installed on your machine

# to run:

clone this repository and navigate to the new directory

- you must input your credentials in the config file, as well as add your client_id to the script tags

  - in your terminal, type 'npm install' and once complete, type 'npm run dev'

open a browser, and go to localhost:5000

# NVP integration:

```
<script>
      paypal
        .Buttons({
          createOrder: () => {
            let SETEC_URL = "set_ec";
            return fetch(SETEC_URL, {
              method: "post"
            })
              .then(res => res.json())
              .then(data => data.token);
          },
          onApprove: (data, actions) => {
            let paymentInfo = {
              orderID: data.orderID,
              payerID: data.payerID
            };

            //Can either redirect here or call DOEC directly from onApprove()
            //ex. actions.redirect('your url here');
            let DOEC_URL = "do_ec";
            console.log(JSON.stringify(paymentInfo));
            return fetch(DOEC_URL, {
              method: "POST",
              body: JSON.stringify(paymentInfo),
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then(response => response.json())
              .then(data => {
                let output = "";
                for (let i in data.arr) {
                  output += data.arr[i] + "\n";
                }
                alert(output);
              });
          }
        })
        .render("#paypal-button");
    </script>
```

# /v1/payments integration: 

```
<script>
      paypal
        .Buttons({
          createOrder: () => {
            const CREATE_PAYMENT_URL = "create_payment";
            return fetch(CREATE_PAYMENT_URL, {
              method: "POST"
            })
              .then(res => res.json())
              .then(data => data.token);
          },
          onApprove: (data, actions) => {
            const EXECUTE_PAYMENT_URL = "execute_payment";
            console.log(data);
            let paymentInfo = {
              payerID: data.payerID,
              paymentID: data.paymentID
            };

            return fetch(EXECUTE_PAYMENT_URL, {
              method: "POST",
              body: JSON.stringify(paymentInfo),
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then(response => response.json())
              .then(data => {
                alert(data.payment);
              });
          }
        })
        .render("#paypal-button");
    </script>
```

# /v1/billing-agreements/agreement-tokens

```
<script>
      paypal
        .Buttons({
          createBillingAgreement: () => {
            let CREATE_BA_TOKEN_URL = "create_ba_token";
            return fetch(CREATE_BA_TOKEN_URL, {
              method: "post"
            })
              .then(res => res.json())
              .then(data => data.billingToken);
          },
          onApprove: data => {
            let FINALIZE_BA_URL = "finalize_ba";

            return fetch(FINALIZE_BA_URL, {
              method: "POST",
              body: JSON.stringify({ billingToken: data.billingToken }),
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then(response => response.json())
              .then(data => {
                alert(data.billingAgreement);
              });
          }
        })
        .render("#paypal-button");
    </script>
```
