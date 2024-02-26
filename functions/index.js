const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
// const {logger} = require("firebase-functions");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
const app = express();

app.get("/hello-world", (req, res) =>
  res.status(200).json({message: "i am from api"})
);

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

// app.put("/:id", (req, res) =>
//   res.send(Widgets.update(req.params.id, req.body))
// );
// app.delete("/:id", (req, res) => res.send(Widgets.delete(req.params.id)));
// app.get("/", (req, res) => res.send(Widgets.list()));

// Expose Express API as a single Cloud Function:
exports.app = onRequest(app);

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
