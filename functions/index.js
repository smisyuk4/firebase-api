const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

require("dotenv").config();
const express = require("express");
const cors = require("cors");

initializeApp();
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_PATH,
    optionsSuccessStatus: 200,
  })
);
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

app.post("/create-payment-intent", async (req, res) => {
  const {updatedArray} = req.body;

  const arrayId = updatedArray.map(({id}) => id);
  let fullData = [];

  try {
    const snapshot = await getFirestore()
      .collection("products")
      .where("id", "in", arrayId)
      .get();

    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    snapshot.forEach((doc) => {
      fullData = [...fullData, doc.data()];
    });

    const mergedArr = updatedArray.map((item, i) =>
      Object.assign({}, item, fullData[i])
    );

    const overallCost = mergedArr.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.cost * currentValue.countInCart;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: overallCost,
      currency: "pln",
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

exports.app = onRequest(app);
