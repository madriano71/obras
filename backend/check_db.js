const mongoose = require('mongoose');

async function checkData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/obras_db');
        console.log('Connected to local MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections Found:', collections.map(c => c.name).join(', '));

        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`- ${coll.name}: ${count} documents`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
