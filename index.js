const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zbjdm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();

        const database = client.db('tourism');
        const toursCollection = database.collection('tours');
        const bookingsCollection = database.collection('bookings');

        // POST or add tours to database
        app.post('/tour', async(req, res) => {
            const tour = req.body;
            const result = await toursCollection.insertOne(tour);
            res.send(result);
        });

        // GET or find tours to database
        app.get('/tours', async(req, res) => {
            const cursor = toursCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET or find a specific tour from database
        app.get('/tour/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await toursCollection.findOne(query);
            res.send(result);
        });

        // POST bookings
        app.post('/booking', async(req, res) => {
            console.log(req.body);
            const result = await bookingsCollection.insertOne(req.body);
            res.send(result);
        })

        // GET a user's bookings
        app.get('/myBookings/:email', async(req, res) => {
            const email = req.params.email;
            const result = await bookingsCollection.find({email: email}).toArray();
            res.send(result);
        })

        // DELETE a booking from a user's bookings
        app.delete('/deleteBooking/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        })

        // GET all bookings
        app.get('/allBookings', async(req, res) => {
            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // UPDATE booking status
        app.put('/allBookings/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id);
            const updateStatus = req.body;
            console.log(req.body);
            const filter = await bookingsCollection.findOne({_id: ObjectId(id)});
            console.log(filter);
            const result = await bookingsCollection.updateOne(filter, {
                $set:{
                    status: updateStatus.status
                }
            })

            res.send(result);
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tourism server is running');
})

app.listen(port, () => {
    console.log('Listening tourism server ', port);
})