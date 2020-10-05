
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kluoa.mongodb.net/burjAlArab?retryWrites=true&w=majority`;



const app = express()

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./configs/burj-al-arab-after-auth-8bc1c-firebase-adminsdk-z4xc8-51a7e028a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookigs");
  console.log('db connection success')
  
  app.post("/addBooking", (req, res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount >0);
      })
      console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      console.log({idToken});

         // idToken comes from the client app
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      const tokenEmail = decodedToken.email;
      const queryEmail = req.query.email;
      console.log(tokenEmail, queryEmail);
      if (tokenEmail == queryEmail) {
            bookings.find({email: queryEmail})
              .toArray((err, documents) => {
                 res.status(200).send(documents);
        })
      }
      else{
        res.status(401).send('un authorized access denied');
      }
      
      // ...
    }).catch(function(error) {
      res.status(401).send('un authorized access denied');
    });
      
    }
    else{
      res.status(401).send('un authorized access denied');
    }

     

    // console.log(req.query.email);
    
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(7000);