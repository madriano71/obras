import mongoose from 'mongoose';
const { Schema } = mongoose;

const orcamentoSchema = new Schema({}, { strict: false });
const Orcamento = mongoose.model('Orcamento', orcamentoSchema);

async function check() {
    try {
        await mongoose.connect('mongodb://mongodb:27017/obras');
        const stats = await Orcamento.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('Status stats:', JSON.stringify(stats, null, 2));

        const approved = await Orcamento.find({ status: 'aprovado' }).limit(5);
        console.log('Sample approved:', JSON.stringify(approved, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
check();
