const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb+srv://Brujos78:7878@tropa78.hyrlkep.mongodb.net/";
const dbName = process.env.MONGODB_DB || "tropa78";

const client = new MongoClient(uri);
let db;

async function conectarMongo() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log(`MongoDB conectado: ${dbName}`);
    }
    return db;
}

module.exports = conectarMongo;
