// Patients List Page JavaScript
class PatientsListPage {
    constructor() {
        this.patients = [];
        this.hospitals = [];
        this.doctors = [];
        this.filteredPatients = [];
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        document.getElementById('backToMain').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('exportPatients').addEventListener('click', () => {
            this.exportPatientsList();
        });

        // Filter event listeners
        document.getElementById('urgencyFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('assignmentFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('searchFilter').addEventListener('input', () => {
            this.applyFilters();
        });
    }

    loadData() {
        console.log('🔄 Loading data in patients list page...');
        // Get data from localStorage
        const storedData = localStorage.getItem('hospitalSystemData');
        if (storedData) {
            const data = JSON.parse(storedData);
            this.patients = data.patients || [];
            this.hospitals = data.hospitals || [];
            this.doctors = data.doctors || [];
            this.filteredPatients = [...this.patients];
            console.log(`✅ Loaded ${this.patients.length} patients from localStorage`);
            this.displayPatients();
            this.updateSummary();
        } else {
            console.log('❌ No data found in localStorage');
            this.showNoDataMessage();
        }
    }

    displayPatients() {
        const container = document.getElementById('patientsGrid');
        container.innerHTML = '';

        if (this.filteredPatients.length === 0) {
            container.innerHTML = '<div class="no-data">No patients found matching the current filters.</div>';
            return;
        }

        this.filteredPatients.forEach(patient => {
            const card = this.createPatientCard(patient);
            container.appendChild(card);
        });
    }

    createPatientCard(patient) {
        const card = document.createElement('div');
        card.className = `patient-card ${patient.urgency} ${patient.assignedHospital !== null ? 'assigned' : 'unassigned'}`;
        
        const hospital = patient.assignedHospital !== null ? 
            this.hospitals.find(h => h.id === patient.assignedHospital) : null;
        const doctor = patient.assignedDoctor !== null ? 
            this.doctors.find(d => d.id === patient.assignedDoctor) : null;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-avatar patient">
                    <i class="fas fa-user"></i>
                </div>
                <div class="card-title">
                    <h3>${patient.name}</h3>
                    <p>ID: ${patient.id} • ${patient.urgency.toUpperCase()}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-item">
                    <span class="card-label">Condition:</span>
                    <span class="card-value">${patient.ailment}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Specialization:</span>
                    <span class="card-value">${patient.requiredSpecialization}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Days in Hospital:</span>
                    <span class="card-value">${patient.daysInHospital || 0} days</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Status:</span>
                    <span class="card-value">${patient.assignedHospital !== null ? 'Assigned' : 'Unassigned'}</span>
                </div>
                ${hospital ? `
                <div class="card-item">
                    <span class="card-label">Hospital:</span>
                    <span class="card-value">${hospital.name}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Bed:</span>
                    <span class="card-value">${patient.bedNumber || 'N/A'}</span>
                </div>
                ` : ''}
                ${doctor ? `
                <div class="card-item">
                    <span class="card-label">Doctor:</span>
                    <span class="card-value">${doctor.name}</span>
                </div>
                ` : ''}
            </div>
        `;

        // Add click event to view patient details
        card.addEventListener('click', () => {
            this.viewPatientDetails(patient.id);
        });

        return card;
    }

    applyFilters() {
        const urgencyFilter = document.getElementById('urgencyFilter').value;
        const assignmentFilter = document.getElementById('assignmentFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredPatients = this.patients.filter(patient => {
            // Urgency filter
            if (urgencyFilter !== 'all' && patient.urgency !== urgencyFilter) {
                return false;
            }

            // Assignment filter
            if (assignmentFilter === 'assigned' && patient.assignedHospital === null) {
                return false;
            }
            if (assignmentFilter === 'unassigned' && patient.assignedHospital !== null) {
                return false;
            }

            // Search filter
            if (searchFilter && !patient.name.toLowerCase().includes(searchFilter)) {
                return false;
            }

            return true;
        });

        this.displayPatients();
        this.updateSummary();
    }

    updateSummary() {
        const criticalCount = this.filteredPatients.filter(p => p.urgency === 'critical').length;
        const urgentCount = this.filteredPatients.filter(p => p.urgency === 'urgent').length;
        const stableCount = this.filteredPatients.filter(p => p.urgency === 'stable').length;
        const assignedCount = this.filteredPatients.filter(p => p.assignedHospital !== null).length;

        document.getElementById('criticalCount').textContent = criticalCount;
        document.getElementById('urgentCount').textContent = urgentCount;
        document.getElementById('stableCount').textContent = stableCount;
        document.getElementById('assignedCount').textContent = assignedCount;
    }

    viewPatientDetails(patientId) {
        // Store current data in localStorage for the patient detail page
        const systemData = {
            patients: this.patients,
            hospitals: this.hospitals,
            doctors: this.doctors
        };
        localStorage.setItem('hospitalSystemData', JSON.stringify(systemData));

        // Navigate to patient detail page
        window.location.href = `patient-detail.html?id=${patientId}`;
    }

    exportPatientsList() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patients_list.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Condition', 'Specialization', 'Urgency', 'Days in Hospital', 'Hospital', 'Bed', 'Doctor', 'Status'];
        const rows = this.filteredPatients.map(patient => {
            const hospital = patient.assignedHospital !== null ? 
                this.hospitals.find(h => h.id === patient.assignedHospital) : null;
            const doctor = patient.assignedDoctor !== null ? 
                this.doctors.find(d => d.id === patient.assignedDoctor) : null;

            return [
                patient.id,
                patient.name,
                patient.ailment,
                patient.requiredSpecialization,
                patient.urgency,
                patient.daysInHospital || 0,
                hospital ? hospital.name : 'Not assigned',
                patient.bedNumber || 'N/A',
                doctor ? doctor.name : 'Not assigned',
                patient.assignedHospital !== null ? 'Assigned' : 'Unassigned'
            ];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showNoDataMessage() {
        const container = document.getElementById('patientsGrid');
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No Data Available</h3>
                <p>Please go back to the main system and generate sample data first.</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html'">
                    <i class="fas fa-arrow-left"></i> Back to Main System
                </button>
            </div>
        `;
    }
}

// Initialize the patients list page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientsListPage = new PatientsListPage();
});
