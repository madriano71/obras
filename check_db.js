import mongoose from 'mongoose';
import { Orcamento } from './backend/src/models/Orcamento.js';

async function check() {
    try {
        await mongoose.connect('mongodb://mongodb:27017/obras');
        const orcs = await Orcamento.find({ status: 'aprovado' });
        console.log(JSON.stringify(orcs, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
