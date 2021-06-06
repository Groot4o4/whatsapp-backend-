import express from "express"
import mongoose from "mongoose"
import Messages from "./dbMessages.js"
import Pusher from "pusher"
import cors from "cors"
//import

//appconfig
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1213875",
    key: "606419d7cfd69a6dd03f",
    secret: "da4ad7127ea630a9a742",
    cluster: "eu",
    useTLS: true
});


//middleware
app.use(express.json());
app.use(cors());

//DB Config
const connection_url = "mongodb+srv://admin:S0xvTSmZzblT4WI1@cluster0.v9thy.mongodb.net/whatsapp?retryWrites=true&w=majority"
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})


//S0xvTSmZzblT4WI1
//pusher




const db = mongoose.connection;

db.once("open", () => {
    console.log("DB Connected")

    const msgCollection = db.collection("messagecontents");

    const changeStream = msgCollection.watch();


    changeStream.on("change", (change) => {
        console.log("change man", change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("message", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        } else { console.log('Error Triggering Pusher') }



    })

})



//app route
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {

        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }

    })
})

app.post('/messages/new', (req, res) => {
    const dbmessage = req.body

    Messages.create(dbmessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})



//listen
app.listen(port, () => console.log(`listenig on port ${port}`));