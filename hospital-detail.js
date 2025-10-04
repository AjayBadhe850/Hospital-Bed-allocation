// Hospital Detail Page JavaScript
class HospitalDetailPage {
    constructor() {
        this.hospital = null;
        this.hospitals = [];
        this.doctors = [];
        this.patients = [];
        this.initializeEventListeners();
        this.loadHospitalData();
    }

    initializeEventListeners() {
        document.getElementById('backToMain').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('backToSearch').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('printHospital').addEventListener('click', () => {
            this.printHospitalDetails();
        });
    }

    loadHospitalData() {
        // Get hospital ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hospitalId = urlParams.get('id');
        
        if (!hospitalId) {
            this.showHospitalNotFound();
            return;
        }

        // Try to get data from localStorage (from main page)
        const storedData = localStorage.getItem('hospitalSystemData');
        if (storedData) {
            const data = JSON.parse(storedData);
            this.hospitals = data.hospitals || [];
            this.doctors = data.doctors || [];
            this.patients = data.patients || [];
            
            // Find the hospital
            this.hospital = this.hospitals.find(h => h.id == hospitalId);
            
            if (this.hospital) {
                this.displayHospitalDetails();
            } else {
                this.showHospitalNotFound();
            }
        } else {
            // If no stored data, show not found
            this.showHospitalNotFound();
        }
    }

    displayHospitalDetails() {
        // Hide not found message
        document.getElementById('hospitalNotFound').style.display = 'none';
        document.getElementById('hospitalDetails').style.display = 'block';

        // Basic hospital information
        document.getElementById('hospitalName').textContent = this.hospital.name;
        document.getElementById('hospitalIdValue').textContent = this.hospital.id;
        document.getElementById('specializationValue').textContent = this.hospital.specialization;

        // Hospital statistics
        this.displayHospitalStats();

        // Hospital blueprint
        this.displayHospitalBlueprint();

        // Assigned patients
        this.displayAssignedPatients();

        // Hospital staff
        this.displayHospitalStaff();
    }

    displayHospitalStats() {
        const totalBeds = this.hospital.capacity;
        const occupiedBeds = this.hospital.currentPatients;
        const availableBeds = totalBeds - occupiedBeds;
        const utilizationRate = (occupiedBeds / totalBeds) * 100;

        document.getElementById('totalBeds').textContent = totalBeds;
        document.getElementById('occupiedBeds').textContent = occupiedBeds;
        document.getElementById('availableBeds').textContent = availableBeds;
        document.getElementById('utilizationRate').textContent = utilizationRate.toFixed(1) + '%';
    }

    displayHospitalBlueprint() {
        const container = document.getElementById('hospitalBlueprint');
        container.innerHTML = '';

        // Get assigned patients for this hospital
        const assignedPatients = this.patients.filter(p => p.assignedHospital === this.hospital.id);
        const occupiedBedNumbers = assignedPatients.map(p => p.bedNumber).filter(bed => bed !== null);

        // Create bed symbols
        for (let i = 1; i <= this.hospital.capacity; i++) {
            const bedSymbol = document.createElement('div');
            const isAllocated = occupiedBedNumbers.includes(i);
            
            bedSymbol.className = `bed-symbol ${isAllocated ? 'allocated' : 'unallocated'}`;
            bedSymbol.innerHTML = `<span>${i}</span>`;
            
            // Add tooltip with patient information if allocated
            if (isAllocated) {
                const patient = assignedPatients.find(p => p.bedNumber === i);
                if (patient) {
                    bedSymbol.title = `Bed ${i}\nPatient: ${patient.name}\nCondition: ${patient.ailment}\nUrgency: ${patient.urgency}`;
                }
            } else {
                bedSymbol.title = `Bed ${i}\nAvailable`;
            }

            container.appendChild(bedSymbol);
        }
    }

    displayAssignedPatients() {
        const container = document.getElementById('assignedPatientsList');
        container.innerHTML = '';

        const assignedPatients = this.patients.filter(p => p.assignedHospital === this.hospital.id);

        if (assignedPatients.length === 0) {
            container.innerHTML = '<div class="no-data">No patients assigned to this hospital.</div>';
            return;
        }

        assignedPatients.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.className = 'patient-item';

            const urgencyIcon = patient.urgency === 'critical' ? '❤️' : 
                               patient.urgency === 'urgent' ? '⚠️' : '✅';

            patientItem.innerHTML = `
                <div class="patient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="patient-details">
                    <h4>${patient.name} ${urgencyIcon}</h4>
                    <p>Bed ${patient.bedNumber || 'N/A'} • ${patient.ailment} • ${patient.urgency}</p>
                </div>
            `;

            container.appendChild(patientItem);
        });
    }

    displayHospitalStaff() {
        const container = document.getElementById('hospitalStaffList');
        container.innerHTML = '';

        const hospitalDoctors = this.doctors.filter(d => d.hospitalId === this.hospital.id);

        if (hospitalDoctors.length === 0) {
            container.innerHTML = '<div class="no-data">No doctors assigned to this hospital.</div>';
            return;
        }

        hospitalDoctors.forEach(doctor => {
            const staffItem = document.createElement('div');
            staffItem.className = 'staff-item';

            const isAvailable = doctor.currentPatients < doctor.maxPatients;
            const statusIcon = isAvailable ? '✅' : '⚠️';

            staffItem.innerHTML = `
                <div class="staff-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="staff-details">
                    <h4>${doctor.name} ${statusIcon}</h4>
                    <p>${doctor.specialization} • ${doctor.experience} years • ${doctor.currentPatients}/${doctor.maxPatients} patients</p>
                </div>
            `;

            container.appendChild(staffItem);
        });
    }

    showHospitalNotFound() {
        document.getElementById('hospitalNotFound').style.display = 'flex';
        document.getElementById('hospitalDetails').style.display = 'none';
    }

    printHospitalDetails() {
        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        const hospitalData = this.generatePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hospital Details - ${this.hospital ? this.hospital.name : 'Unknown'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #007BFF; padding-bottom: 20px; margin-bottom: 30px; }
                    .section { margin-bottom: 30px; }
                    .section h3 { color: #007BFF; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
                    .stat-item { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
                    .stat-value { font-size: 2rem; font-weight: bold; color: #007BFF; }
                    .stat-label { color: #666; margin-top: 5px; }
                    .blueprint { display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; margin: 20px 0; }
                    .bed { width: 30px; height: 30px; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                    .bed.allocated { background: #007BFF; }
                    .bed.unallocated { background: #dc3545; }
                    .patients-list, .staff-list { margin-top: 20px; }
                    .item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                ${hospitalData}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintContent() {
        if (!this.hospital) return '<h1>Hospital not found</h1>';

        const assignedPatients = this.patients.filter(p => p.assignedHospital === this.hospital.id);
        const hospitalDoctors = this.doctors.filter(d => d.hospitalId === this.hospital.id);
        const occupiedBedNumbers = assignedPatients.map(p => p.bedNumber).filter(bed => bed !== null);

        return `
            <div class="header">
                <h1>Hospital Details</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="section">
                <h3>Hospital Information</h3>
                <p><strong>Name:</strong> ${this.hospital.name}</p>
                <p><strong>ID:</strong> ${this.hospital.id}</p>
                <p><strong>Specialization:</strong> ${this.hospital.specialization}</p>
            </div>

            <div class="section">
                <h3>Hospital Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${this.hospital.capacity}</div>
                        <div class="stat-label">Total Beds</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.hospital.currentPatients}</div>
                        <div class="stat-label">Occupied Beds</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.hospital.capacity - this.hospital.currentPatients}</div>
                        <div class="stat-label">Available Beds</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${((this.hospital.currentPatients / this.hospital.capacity) * 100).toFixed(1)}%</div>
                        <div class="stat-label">Utilization Rate</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Hospital Blueprint</h3>
                <div class="blueprint">
                    ${Array.from({length: this.hospital.capacity}, (_, i) => {
                        const bedNumber = i + 1;
                        const isAllocated = occupiedBedNumbers.includes(bedNumber);
                        return `<div class="bed ${isAllocated ? 'allocated' : 'unallocated'}">${bedNumber}</div>`;
                    }).join('')}
                </div>
                <p><strong>Legend:</strong> <span style="color: #007BFF;">Blue = Allocated</span>, <span style="color: #dc3545;">Red = Available</span></p>
            </div>

            <div class="section">
                <h3>Assigned Patients (${assignedPatients.length})</h3>
                <div class="patients-list">
                    ${assignedPatients.map(patient => `
                        <div class="item">
                            <strong>${patient.name}</strong> - Bed ${patient.bedNumber || 'N/A'}<br>
                            ${patient.ailment} • ${patient.urgency}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Hospital Staff (${hospitalDoctors.length})</h3>
                <div class="staff-list">
                    ${hospitalDoctors.map(doctor => `
                        <div class="item">
                            <strong>${doctor.name}</strong><br>
                            ${doctor.specialization} • ${doctor.experience} years • ${doctor.currentPatients}/${doctor.maxPatients} patients
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize the hospital detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hospitalDetailPage = new HospitalDetailPage();
});
