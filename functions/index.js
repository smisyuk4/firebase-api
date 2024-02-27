const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

require("dotenv").config();
const express = require("express");

initializeApp();
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/api/messages", async (req, res) => {
  const writeResult = await getFirestore()
    .collection("messages")
    .add({text: req.body.text});

  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

app.post("/api/charge", async (req, res) => {
  const {id, amount} = req.body;

  const writeResult = await getFirestore()
    .collection("charge")
    .add({id, amount});

  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400 * items;
};

app.post("/create-payment-intent", async (req, res) => {
  const {items} = req.body;

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "pln",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.log("error: ", e);
    res.send({
      stripe: stripe ? stripe : null,
      stripePublicKey: stripePublicKey ? stripePublicKey : null,
      error: e,
    });
  }
});

// app.put("/:id", (req, res) =>
//   res.send(Widgets.update(req.params.id, req.body))
// );
// app.delete("/:id", (req, res) => res.send(Widgets.delete(req.params.id)));
// app.get("/", (req, res) => res.send(Widgets.list()));

// // Take the text parameter passed to this HTTP endpoint and insert it into
// // Firestore under the path /messages/:documentId/original
// exports.addmessage = onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await getFirestore()
//     .collection("messages")
//     .add({original: original});
//   // Send back a message that we've successfully written the message
//   res.json({result: `Message with ID: ${writeResult.id} added.`});
// });

exports.app = onRequest(app);
