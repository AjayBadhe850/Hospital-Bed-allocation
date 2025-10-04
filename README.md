# 🏥 Hospital Assignment System

A web-based intelligent hospital management simulation that assigns patients to hospitals and doctors efficiently using combinatorial optimization algorithms.

## 🚀 Features

- **Patient Management**: Add, edit, delete, and search patients
- **Hospital Assignment**: Optimize patient-to-hospital assignments
- **Doctor Allocation**: Match patients with appropriate doctors
- **Real-time Visualization**: Animated allocation process
- **Bed Management**: Track bed availability and assignments
- **Backend API**: RESTful API for data persistence
- **Responsive Design**: Works on all devices

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Google Fonts (Poppins, Open Sans)
- CSS Animations & Keyframes

### Backend
- Node.js
- Express.js
- JSON file storage
- CORS enabled
- RESTful API

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

### 1. Clone or Download
```bash
# If using git
git clone <repository-url>
cd hospital-assignment-system

# Or download and extract the files
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Data Management
- `GET /api/data` - Get all system data (patients, hospitals, doctors)
- `POST /api/data` - Save all system data

### Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/search/:query` - Search patients by name

### Example API Usage

#### Create a new patient:
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "ailment": "Heart Attack",
    "urgency": "critical",
    "specialization": "Cardiology",
    "location": {"x": 50, "y": 60}
  }'
```

#### Search patients:
```bash
curl http://localhost:3000/api/patients/search/john
```

## 📁 Project Structure

```
hospital-assignment-system/
├── index.html              # Main application page
├── patient-detail.html     # Patient detail page
├── hospital-detail.html    # Hospital detail page
├── patients-list.html      # Patients list page
├── doctors-list.html       # Doctors list page
├── hospitals-list.html     # Hospitals list page
├── style.css              # All styling and animations
├── script.js              # Main application logic
├── patient-detail.js      # Patient detail page logic
├── hospital-detail.js     # Hospital detail page logic
├── patients-list.js       # Patients list page logic
├── doctors-list.js        # Doctors list page logic
├── hospitals-list.js      # Hospitals list page logic
├── server.js              # Backend server
├── package.json           # Node.js dependencies
├── data/                  # Data storage directory
│   └── hospital-data.json # JSON database file
└── README.md              # This file
```

## 🎯 Core Algorithms

1. **Graph Matching**: Patient-to-hospital assignment optimization
2. **Knapsack Dynamic Programming**: Resource allocation optimization
3. **Branch & Bound**: Global optimization for best solutions

## 🎨 Features

### Patient Management
- Add patients with medical information
- Search patients by name
- View patient details and assignments
- Track admission dates and hospital stay duration

### Hospital Management
- View hospital capacity and utilization
- Bed allocation visualization
- Hospital staff information
- Real-time status updates

### Doctor Management
- Doctor specialization matching
- Patient load tracking
- Experience-based assignments
- Availability status

### Visualization
- Animated patient-to-hospital assignments
- Color-coded status indicators
- Interactive hospital symbols
- Bed allocation blueprints

## 🔄 Data Persistence

The system uses JSON file storage for data persistence:
- **Location**: `data/hospital-data.json`
- **Format**: JSON with patients, hospitals, and doctors arrays
- **Auto-backup**: Data is automatically saved on every operation
- **Real-time sync**: Frontend and backend stay synchronized

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the API health endpoint: `GET /api/health`
- Review the browser console for errors
- Ensure Node.js and npm are properly installed
- Verify all dependencies are installed with `npm install`

## 🔮 Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- User authentication and authorization
- Real-time notifications
- Advanced reporting and analytics
- Mobile app development
- Integration with hospital management systems