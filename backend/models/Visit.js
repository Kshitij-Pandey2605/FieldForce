const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    contactName: { type: String },
    contactPhone: { type: String },
    photoUri: { type: String },
    notes: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', visitSchema);
