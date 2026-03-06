
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Orcamento } from './models/Orcamento.js';

dotenv.config({ path: '../.env' });

async function check() {
    try {
        const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
        const dbName = process.env.DATABASE_NAME || 'obras_db';
        console.log(`Connecting to ${url}/${dbName}`);
        await mongoose.connect(`${url}/${dbName}`);
        console.log('Connected to MongoDB');

        const approved = await Orcamento.find({ status: 'aprovado' });
        console.log(`Found ${approved.length} approved budgets`);

        if (approved.length > 0) {
            console.log('First approved budget:', JSON.stringify(approved[0], null, 2));
        } else {
            const any = await Orcamento.findOne();
            console.log('Sample budget (any status):', JSON.stringify(any, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
