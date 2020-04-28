
// Reference --> https://firebase.google.com/docs/functions/typescript

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// Configuration to connect to firebase
const serviceAccount = require('./secure/rtgraphics-adminsdk-sppfh.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rtgraphics-6c768.firebaseio.com"
});
const db = admin.firestore();


//---> Using Native Firebase Functions
 export const helloWorld = functions.https.onRequest((request, response) => {

  response.json(`Hello World from Firebase Functions`);
  
 });

 export const getGOTY = functions.https.onRequest( async (request, response) => {
     
     const docsSnapshot = await db.collection('goty').get();
     const listOfGOTYS  = await docsSnapshot.docs.map(doc => doc.data());

     response.json(listOfGOTYS);
   });


//---> Using Express
const app = express();
app.use( cors ({origin: true}));

app.post('/hello/:name', async (req, res) => {
    const name = req.params.name;

     res.status(200)
        .json({
              ok: true,
              message1: `Hello ${name}`,
              message2: `Can you imagine the possibilities with a Cloud Functions Architecture ?`
            });
});

app.get('/goty', async (req, res) => {
    const docsSnapshot = await db.collection('goty').get();
    const listOfGOTYS  = await docsSnapshot.docs.map(doc => doc.data());

     res.json(listOfGOTYS);

});

app.post('/goty/:id', async (req, res) => {
   const id = req.params.id;
   const gameReference = await db.collection('goty').doc(id);
   const gameSnapshot  = await gameReference.get();

   if (!gameSnapshot.exists) {
       res.status(404)
          .json({
              ok: false,
              message: `Isn\'t exists a game with id ${id}`
            });
    } else {
        const game = gameSnapshot.data() || {votes : 0};
        await gameReference.update({
           votes: game.votes + 1
        });
        
        res.status(201)
        .json({
              ok:true,
              message: 'All Ok'
            })
   }
});

exports.apiv1 = functions.https.onRequest(app);

