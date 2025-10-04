// Hospitals List Page JavaScript
class HospitalsListPage {
    constructor() {
        this.hospitals = [];
        this.doctors = [];
        this.patients = [];
        this.filteredHospitals = [];
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        document.getElementById('backToMain').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('exportHospitals').addEventListener('click', () => {
            this.exportHospitalsList();
        });

        // Filter event listeners
        document.getElementById('specializationFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('capacityFilter').addEventListener('change', () => {
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
            this.hospitals = data.hospitals || [];
            this.doctors = data.doctors || [];
            this.patients = data.patients || [];
            this.filteredHospitals = [...this.hospitals];
            this.displayHospitals();
            this.updateSummary();
        } else {
            this.showNoDataMessage();
        }
    }

    displayHospitals() {
        const container = document.getElementById('hospitalsGrid');
        container.innerHTML = '';

        if (this.filteredHospitals.length === 0) {
            container.innerHTML = '<div class="no-data">No hospitals found matching the current filters.</div>';
            return;
        }

        this.filteredHospitals.forEach(hospital => {
            const card = this.createHospitalCard(hospital);
            container.appendChild(card);
        });
    }

    createHospitalCard(hospital) {
        const card = document.createElement('div');
        const availableBeds = hospital.capacity - hospital.currentPatients;
        const utilization = (hospital.currentPatients / hospital.capacity) * 100;
        
        let statusClass = 'available';
        if (utilization >= 100) statusClass = 'full';
        else if (utilization >= 70) statusClass = 'filling';
        
        card.className = `hospital-card ${statusClass}`;

        const hospitalDoctors = this.doctors.filter(d => d.hospitalId === hospital.id);
        const hospitalPatients = this.patients.filter(p => p.assignedHospital === hospital.id);

        card.innerHTML = `
            <div class="card-header">
                <div class="card-avatar hospital">
                    <i class="fas fa-hospital"></i>
                </div>
                <div class="card-title">
                    <h3>${hospital.name}</h3>
                    <p>${hospital.specialization} • ${hospital.capacity} beds</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-item">
                    <span class="card-label">Specialization:</span>
                    <span class="card-value">${hospital.specialization}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Total Capacity:</span>
                    <span class="card-value">${hospital.capacity} beds</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Current Patients:</span>
                    <span class="card-value">${hospital.currentPatients}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Available Beds:</span>
                    <span class="card-value">${availableBeds}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Utilization:</span>
                    <span class="card-value">${utilization.toFixed(1)}%</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Doctors:</span>
                    <span class="card-value">${hospitalDoctors.length}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Status:</span>
                    <span class="card-value">${utilization >= 100 ? 'Full' : utilization >= 70 ? 'Filling' : 'Available'}</span>
                </div>
                <div class="card-item">
                    <span class="card-label">Equipment:</span>
                    <span class="card-value">${hospital.equipment.length} items</span>
                </div>
            </div>
        `;

        return card;
    }

    applyFilters() {
        const specializationFilter = document.getElementById('specializationFilter').value;
        const capacityFilter = document.getElementById('capacityFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredHospitals = this.hospitals.filter(hospital => {
            // Specialization filter
            if (specializationFilter !== 'all' && hospital.specialization !== specializationFilter) {
                return false;
            }

            // Capacity filter
            if (capacityFilter !== 'all') {
                if (capacityFilter === 'low' && hospital.capacity > 10) return false;
                if (capacityFilter === 'medium' && (hospital.capacity <= 10 || hospital.capacity > 20)) return false;
                if (capacityFilter === 'high' && hospital.capacity <= 20) return false;
            }

            // Search filter
            if (searchFilter && !hospital.name.toLowerCase().includes(searchFilter)) {
                return false;
            }

            return true;
        });

        this.displayHospitals();
        this.updateSummary();
    }

    updateSummary() {
        const totalHospitals = this.filteredHospitals.length;
        const availableBeds = this.filteredHospitals.reduce((sum, h) => sum + (h.capacity - h.currentPatients), 0);
        const occupiedBeds = this.filteredHospitals.reduce((sum, h) => sum + h.currentPatients, 0);
        const avgUtilization = this.filteredHospitals.length > 0 ? 
            this.filteredHospitals.reduce((sum, h) => sum + (h.currentPatients / h.capacity), 0) / this.filteredHospitals.length * 100 : 0;

        document.getElementById('totalHospitals').textContent = totalHospitals;
        document.getElementById('availableHospitals').textContent = availableBeds;
        document.getElementById('occupiedBeds').textContent = occupiedBeds;
        document.getElementById('avgUtilization').textContent = avgUtilization.toFixed(1) + '%';
    }

    exportHospitalsList() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hospitals_list.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Specialization', 'Capacity', 'Current Patients', 'Available Beds', 'Utilization', 'Doctors', 'Status'];
        const rows = this.filteredHospitals.map(hospital => {
            const availableBeds = hospital.capacity - hospital.currentPatients;
            const utilization = (hospital.currentPatients / hospital.capacity) * 100;
            const hospitalDoctors = this.doctors.filter(d => d.hospitalId === hospital.id).length;
            const status = utilization >= 100 ? 'Full' : utilization >= 70 ? 'Filling' : 'Available';

            return [
                hospital.id,
                hospital.name,
                hospital.specialization,
                hospital.capacity,
                hospital.currentPatients,
                availableBeds,
                utilization.toFixed(1) + '%',
                hospitalDoctors,
                status
            ];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showNoDataMessage() {
        const container = document.getElementById('hospitalsGrid');
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

// Initialize the hospitals list page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hospitalsListPage = new HospitalsListPage();
});
