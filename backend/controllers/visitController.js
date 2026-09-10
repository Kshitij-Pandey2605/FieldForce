const Visit = require('../models/Visit');

// Get all visits for the logged-in user
exports.getVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits', error: error.message });
  }
};

// Get a single visit by ID
exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    if (visit.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visit', error: error.message });
  }
};

// Create a new visit
exports.createVisit = async (req, res) => {
  try {
    const { title, description, location, latitude, longitude, address, contactName, contactPhone, notes } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const visit = await Visit.create({
      title,
      description,
      location,
      latitude,
      longitude,
      address,
      contactName,
      contactPhone,
      notes,
      status: 'pending',
      startTime: new Date(),
      user: req.user.id,
    });

    res.status(201).json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating visit', error: error.message });
  }
};

// Update a visit
exports.updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    if (visit.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, status, location, latitude, longitude, address, contactName, contactPhone, photoUri, notes, endTime } = req.body;

    if (title) visit.title = title;
    if (description !== undefined) visit.description = description;
    if (status) visit.status = status;
    if (location) visit.location = location;
    if (latitude !== undefined) visit.latitude = latitude;
    if (longitude !== undefined) visit.longitude = longitude;
    if (address) visit.address = address;
    if (contactName) visit.contactName = contactName;
    if (contactPhone) visit.contactPhone = contactPhone;
    if (photoUri) visit.photoUri = photoUri;
    if (notes) visit.notes = notes;
    if (status === 'completed' && !visit.endTime) visit.endTime = new Date();
    if (endTime) visit.endTime = endTime;

    await visit.save();
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating visit', error: error.message });
  }
};

// Delete a visit
exports.deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    if (visit.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Visit.deleteOne({ _id: req.params.id });
    res.json({ message: 'Visit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting visit', error: error.message });
  }
};

// Upload a photo for a visit
exports.uploadVisitPhoto = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    if (visit.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Store relative URL path to visit photo
    visit.photoUri = `/uploads/${req.file.filename}`;
    await visit.save();

    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
};
