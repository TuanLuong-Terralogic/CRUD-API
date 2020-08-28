// const mongoose = require('mongoose');
// const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// const EventSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User'
//     },
//     name: {
//         type: String,
//         required: 'Event name is required'
//     },
//     location: {
//         type: String,
//         required: true
//     },
//     address: {
//         type: String
//     }, 
//     start_date: {
//         type: String,
//         required: true
//     },
//     end_date: {
//         type: String,
//     },
//     description: {
//         type: String,
//         required: true,
//         max: 255
//     },
//     image: {
//         type: String,
//         required: false,
//         max: 255
//     }
// }, {timestamps: true});

// EventSchema.plugin(aggregatePaginate);

// module.exports = mongoose.model('Event', EventSchema);