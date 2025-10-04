// Doctors List Page JavaScript
class DoctorsListPage {
    constructor() {
        this.doctors = [];
        this.hospitals = [];
        this.patients = [];
        this.filteredDoctors = [];
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        document.getElementById('backToMain').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('exportDoctors').addEventListener('click', () => {
            this.exportDoctorsList();
        });

        // Filter event listeners
        document.getElementById('specializationFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('hospitalFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('searchFilter').addEventListener('input', () => {
            this.applyFilters();
        });
    }

    loadData() {
        // Get data from localStorage
        const storedData = localStorage.getItem('hospitalSystemData');
        if (storedData) {
            const data = JSON.parse(storedData);
            this.doctors = data.doctors || [];
            this.hospitals = data.hospitals || [];
            this.patients = data.patients || [];
            this.filteredDoctors = [...this.doctors];
            this.populateHospitalFilter();
            this.displayDoctors();
            this.updateSummary();
        } else {
            this.showNoDataMessage();
        }
    }

    populateHospitalFilter() {
        const hospitalFilter = document.getElementById('hospitalFilter');
        hospitalFilter.innerHTML = '<option value="all">All Hospitals</option>';
        
        this.hospitals.forEach(hospital => {
            const option = document.createElement('option');
            option.value = hospital.id;
            option.textContent = hospital.name;
            hospitalFilter.appendChild(option);
        });
    }

    displayDoctors() {
        const container = document.getElementById('doctorsGrid');
        container.innerHTML = '';

        if (this.filteredDoctors.length === 0) {
            container.innerHTML = '<div class="no-data">No doctors found matching the current filters.</div>';
            return;
        }

        this.filteredDoctors.forEach(doctor => {
            const card = this.createDoctorCard(doctor);
            container.appendChild(card);
        });
    }

    createDoctorCard(doctor) {
        const card = document.createElement('div');
        const hospital = this.hospitals.find(h => h.id === doctor.hospitalId);
        const isAvailable = doctor.currentPatients < doctor.maxPatients;
        
        card.className = `doctor-card ${isAvailable ? 'available' : 'busy'}`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-avatar doctor">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="card-title">
                    <h3>${doctor.name}</h3>
                    <p>${doctor.specialization} • ${hospital ? hospital.name : 'Unknown Hospital'}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-item">
                    <span class="card-label">Specialization:</span>
                    <span class="card-value">${doctor.specialization}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Experience:</span>
                    <span class="card-value">${doctor.experience} years</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Current Patients:</span>
                    <span class="card-value">${doctor.currentPatients}/${doctor.maxPatients}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Status:</span>
                    <span class="card-value">${isAvailable ? 'Available' : 'Busy'}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Hospital:</span>
                    <span class="card-value">${hospital ? hospital.name : 'Unknown'}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Utilization:</span>
                    <span class="card-value">${Math.round((doctor.currentPatients / doctor.maxPatients) * 100)}%</span>
                </div>
            </div>
        `;

        return card;
    }

    applyFilters() {
        const specializationFilter = document.getElementById('specializationFilter').value;
        const hospitalFilter = document.getElementById('hospitalFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredDoctors = this.doctors.filter(doctor => {
            // Specialization filter
            if (specializationFilter !== 'all' && doctor.specialization !== specializationFilter) {
                return false;
            }

            // Hospital filter
            if (hospitalFilter !== 'all' && doctor.hospitalId != hospitalFilter) {
                return false;
            }

            // Search filter
            if (searchFilter && !doctor.name.toLowerCase().includes(searchFilter)) {
                return false;
            }

            return true;
        });

        this.displayDoctors();
        this.updateSummary();
    }

    updateSummary() {
        const totalDoctors = this.filteredDoctors.length;
        const availableDoctors = this.filteredDoctors.filter(d => d.currentPatients < d.maxPatients).length;
        const busyDoctors = this.filteredDoctors.filter(d => d.currentPatients >= d.maxPatients).length;
        const avgExperience = this.filteredDoctors.length > 0 ? 
            Math.round(this.filteredDoctors.reduce((sum, d) => sum + d.experience, 0) / this.filteredDoctors.length) : 0;

        document.getElementById('totalDoctors').textContent = totalDoctors;
        document.getElementById('availableDoctors').textContent = availableDoctors;
        document.getElementById('busyDoctors').textContent = busyDoctors;
        document.getElementById('avgExperience').textContent = avgExperience;
    }

    exportDoctorsList() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doctors_list.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Specialization', 'Experience', 'Hospital', 'Current Patients', 'Max Patients', 'Utilization', 'Status'];
        const rows = this.filteredDoctors.map(doctor => {
            const hospital = this.hospitals.find(h => h.id === doctor.hospitalId);
            const isAvailable = doctor.currentPatients < doctor.maxPatients;

            return [
                doctor.id,
                doctor.name,
                doctor.specialization,
                doctor.experience,
                hospital ? hospital.name : 'Unknown',
                doctor.currentPatients,
                doctor.maxPatients,
                Math.round((doctor.currentPatients / doctor.maxPatients) * 100) + '%',
                isAvailable ? 'Available' : 'Busy'
            ];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showNoDataMessage() {
        const container = document.getElementById('doctorsGrid');
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

// Initialize the doctors list page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doctorsListPage = new DoctorsListPage();
});
