import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/obras_db');
        console.log('Connected to local MongoDB');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        for (const c of collections) {
            const count = await mongoose.connection.db.collection(c.name).countDocuments();
            console.log(`Collection ${c.name} count: ${count}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
