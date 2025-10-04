const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://yourusername.github.io', 'https://hospital-bed-respiratory.vercel.app']
        : true,
    credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'hospital-data.json');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(DATA_FILE));

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            patients: [],
            hospitals: [],
            doctors: [],
            lastUpdated: new Date().toISOString()
        };
        fs.writeJsonSync(DATA_FILE, initialData, { spaces: 2 });
    }
};

// Load data from file
const loadData = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return fs.readJsonSync(DATA_FILE);
        }
        return { patients: [], hospitals: [], doctors: [], lastUpdated: new Date().toISOString() };
    } catch (error) {
        console.error('Error loading data:', error);
        return { patients: [], hospitals: [], doctors: [], lastUpdated: new Date().toISOString() };
    }
};

// Save data to file
const saveData = (data) => {
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
};

// Initialize data file on startup
initializeDataFile();

// API Routes

// Get all data
app.get('/api/data', (req, res) => {
    try {
        const data = loadData();
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load data'
        });
    }
});

// Get all patients
app.get('/api/patients', (req, res) => {
    try {
        const data = loadData();
        res.json({
            success: true,
            patients: data.patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load patients'
        });
    }
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
    try {
        const data = loadData();
        const patient = data.patients.find(p => p.id == req.params.id);
        
        if (patient) {
            res.json({
                success: true,
                patient: patient
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load patient'
        });
    }
});

// Create new patient
app.post('/api/patients', (req, res) => {
    try {
        const data = loadData();
        const { name, ailment, urgency, specialization, location } = req.body;
        
        // Validate required fields
        if (!name || !ailment || !urgency || !specialization) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, ailment, urgency, specialization'
            });
        }
        
        // Generate new patient ID
        const newId = data.patients.length > 0 ? Math.max(...data.patients.map(p => p.id)) + 1 : 1;
        
        const newPatient = {
            id: newId,
            name: name,
            ailment: ailment,
            urgency: urgency,
            specialization: specialization,
            location: location || { x: Math.random() * 100, y: Math.random() * 100 },
            assignedHospital: null,
            assignedDoctor: null,
            bedNumber: null,
            admissionDate: new Date().toISOString(),
            daysInHospital: 0
        };
        
        data.patients.push(newPatient);
        
        if (saveData(data)) {
            res.status(201).json({
                success: true,
                patient: newPatient,
                message: 'Patient created successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save patient'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create patient'
        });
    }
});

// Update patient
app.put('/api/patients/:id', (req, res) => {
    try {
        const data = loadData();
        const patientIndex = data.patients.findIndex(p => p.id == req.params.id);
        
        if (patientIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        // Update patient data
        const updatedPatient = {
            ...data.patients[patientIndex],
            ...req.body,
            id: parseInt(req.params.id) // Ensure ID doesn't change
        };
        
        data.patients[patientIndex] = updatedPatient;
        
        if (saveData(data)) {
            res.json({
                success: true,
                patient: updatedPatient,
                message: 'Patient updated successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save patient'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update patient'
        });
    }
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
    try {
        const data = loadData();
        const patientIndex = data.patients.findIndex(p => p.id == req.params.id);
        
        if (patientIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        const deletedPatient = data.patients.splice(patientIndex, 1)[0];
        
        if (saveData(data)) {
            res.json({
                success: true,
                patient: deletedPatient,
                message: 'Patient deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete patient'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete patient'
        });
    }
});

// Save all system data (for frontend sync)
app.post('/api/data', (req, res) => {
    try {
        const { patients, hospitals, doctors } = req.body;
        
        if (!Array.isArray(patients) || !Array.isArray(hospitals) || !Array.isArray(doctors)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data format. Expected arrays for patients, hospitals, and doctors.'
            });
        }
        
        const data = {
            patients: patients,
            hospitals: hospitals,
            doctors: doctors,
            lastUpdated: new Date().toISOString()
        };
        
        if (saveData(data)) {
            res.json({
                success: true,
                message: 'Data saved successfully',
                data: data
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save data'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to save data'
        });
    }
});

// Search patients by name
app.get('/api/patients/search/:query', (req, res) => {
    try {
        const data = loadData();
        const query = req.params.query.toLowerCase();
        
        const matchingPatients = data.patients.filter(patient => 
            patient.name.toLowerCase().includes(query)
        );
        
        res.json({
            success: true,
            patients: matchingPatients,
            count: matchingPatients.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to search patients'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hospital Assignment System API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏥 Hospital Assignment System Backend running on port ${PORT}`);
    console.log(`📊 API Documentation:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/data - Get all system data`);
    console.log(`   POST /api/data - Save all system data`);
    console.log(`   GET  /api/patients - Get all patients`);
    console.log(`   GET  /api/patients/:id - Get patient by ID`);
    console.log(`   POST /api/patients - Create new patient`);
    console.log(`   PUT  /api/patients/:id - Update patient`);
    console.log(`   DELETE /api/patients/:id - Delete patient`);
    console.log(`   GET  /api/patients/search/:query - Search patients by name`);
    console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
});

module.exports = app;
