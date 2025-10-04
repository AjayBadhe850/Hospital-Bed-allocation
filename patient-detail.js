// Patient Detail Page JavaScript
class PatientDetailPage {
    constructor() {
        this.patient = null;
        this.hospitals = [];
        this.doctors = [];
        this.initializeEventListeners();
        this.loadPatientData();
    }

    initializeEventListeners() {
        document.getElementById('backToMain').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('backToSearch').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('printPatient').addEventListener('click', () => {
            this.printPatientDetails();
        });

        document.getElementById('allocateDoctor').addEventListener('click', () => {
            this.allocateDoctor();
        });
    }

    loadPatientData() {
        // Get patient ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('id');
        
        if (!patientId) {
            this.showPatientNotFound();
            return;
        }

        // Try to get data from localStorage (from main page)
        const storedData = localStorage.getItem('hospitalSystemData');
        if (storedData) {
            const data = JSON.parse(storedData);
            this.hospitals = data.hospitals || [];
            this.doctors = data.doctors || [];
            
            // Find the patient
            this.patient = data.patients.find(p => p.id == patientId);
            
            if (this.patient) {
                this.displayPatientDetails();
            } else {
                this.showPatientNotFound();
            }
        } else {
            // If no stored data, show not found
            this.showPatientNotFound();
        }
    }

    displayPatientDetails() {
        // Hide not found message
        document.getElementById('patientNotFound').style.display = 'none';
        document.getElementById('patientDetails').style.display = 'block';

        // Basic patient information
        document.getElementById('patientName').textContent = this.patient.name;
        document.getElementById('patientIdValue').textContent = this.patient.id;
        document.getElementById('urgencyValue').textContent = this.patient.urgency;
        
        // Update urgency badge styling
        const urgencyBadge = document.getElementById('patientUrgency');
        urgencyBadge.className = `meta-item urgency-badge ${this.patient.urgency}`;

        // Medical information
        document.getElementById('patientCondition').textContent = this.patient.ailment;
        document.getElementById('requiredSpecialization').textContent = this.patient.requiredSpecialization;
        
        // Calculate admission date and days in hospital
        const admissionDate = this.calculateAdmissionDate();
        const daysInHospital = this.calculateDaysInHospital();
        
        document.getElementById('admissionDate').textContent = admissionDate;
        document.getElementById('daysInHospital').textContent = daysInHospital;

        // Assignment information
        this.displayAssignmentInfo();

        // Hospital information (if assigned)
        if (this.patient.assignedHospital !== null) {
            this.displayHospitalInfo();
        }

        // Doctor information (if assigned)
        if (this.patient.assignedDoctor !== null) {
            this.displayDoctorInfo();
        } else {
            // Show allocate doctor button if no doctor assigned
            this.showAllocateDoctorButton();
        }

        // Treatment timeline
        this.displayTreatmentTimeline();
    }

    displayAssignmentInfo() {
        const assignmentStatus = document.getElementById('assignmentStatus');
        
        if (this.patient.assignedHospital !== null) {
            assignmentStatus.className = 'assignment-status assigned';
            assignmentStatus.innerHTML = `
                <h4><i class="fas fa-check-circle"></i> Patient Assigned</h4>
                <p>This patient has been successfully assigned to a hospital and is receiving treatment.</p>
            `;
        } else {
            assignmentStatus.className = 'assignment-status unassigned';
            assignmentStatus.innerHTML = `
                <h4><i class="fas fa-exclamation-triangle"></i> Not Assigned</h4>
                <p>This patient has not been assigned to any hospital yet. Please run the allocation algorithm.</p>
            `;
        }
    }

    displayHospitalInfo() {
        const hospital = this.hospitals.find(h => h.id === this.patient.assignedHospital);
        if (hospital) {
            document.getElementById('hospitalInfo').style.display = 'block';
            document.getElementById('hospitalName').textContent = hospital.name;
            document.getElementById('hospitalSpecialization').textContent = hospital.specialization;
            document.getElementById('bedNumber').textContent = this.patient.bedNumber || 'Not assigned';
            document.getElementById('travelDistance').textContent = `${this.patient.travelDistance.toFixed(1)} km`;
        }
    }

    displayDoctorInfo() {
        const doctor = this.doctors.find(d => d.id === this.patient.assignedDoctor);
        if (doctor) {
            document.getElementById('doctorInfo').style.display = 'block';
            document.getElementById('doctorName').textContent = doctor.name;
            document.getElementById('doctorSpecialization').textContent = doctor.specialization;
            document.getElementById('doctorExperience').textContent = doctor.experience;
            document.getElementById('doctorCurrentPatients').textContent = doctor.currentPatients;
        }
    }

    displayTreatmentTimeline() {
        const admissionTime = this.calculateAdmissionDate();
        const assignmentTime = this.patient.assignedHospital ? 
            this.calculateAssignmentTime() : 'Not assigned yet';
        const doctorAssignmentTime = this.patient.assignedDoctor ? 
            this.calculateDoctorAssignmentTime() : 'Not assigned yet';

        document.getElementById('admissionTime').textContent = admissionTime;
        document.getElementById('assignmentTime').textContent = assignmentTime;
        document.getElementById('doctorAssignmentTime').textContent = doctorAssignmentTime;
        
        const currentStatus = this.patient.assignedHospital ? 
            'Under treatment' : 'Waiting for assignment';
        document.getElementById('currentStatus').textContent = currentStatus;
    }

    calculateAdmissionDate() {
        // Simulate admission date (7 days ago for demo)
        const admissionDate = new Date();
        admissionDate.setDate(admissionDate.getDate() - 7);
        return admissionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    calculateDaysInHospital() {
        // Simulate days in hospital (7 days for demo)
        return '7 days';
    }

    calculateAssignmentTime() {
        // Simulate assignment time (6 days ago for demo)
        const assignmentDate = new Date();
        assignmentDate.setDate(assignmentDate.getDate() - 6);
        return assignmentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    calculateDoctorAssignmentTime() {
        // Simulate doctor assignment time (5 days ago for demo)
        const doctorDate = new Date();
        doctorDate.setDate(doctorDate.getDate() - 5);
        return doctorDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showPatientNotFound() {
        document.getElementById('patientNotFound').style.display = 'flex';
        document.getElementById('patientDetails').style.display = 'none';
    }

    showAllocateDoctorButton() {
        const allocateButton = document.getElementById('allocateDoctor');
        allocateButton.style.display = 'inline-flex';
        allocateButton.innerHTML = '<i class="fas fa-user-md"></i> Allocate Doctor';
    }

    allocateDoctor() {
        if (!this.patient) return;

        // Find available doctors with matching specialization
        const availableDoctors = this.doctors.filter(doctor => 
            doctor.specialization === this.patient.requiredSpecialization && 
            doctor.currentPatients < doctor.maxPatients
        );

        if (availableDoctors.length === 0) {
            alert('No available doctors with the required specialization found.');
            return;
        }

        // Sort doctors by experience and current patient load
        availableDoctors.sort((a, b) => {
            const aScore = a.experience - (a.currentPatients / a.maxPatients) * 10;
            const bScore = b.experience - (b.currentPatients / b.maxPatients) * 10;
            return bScore - aScore;
        });

        // Assign the best doctor
        const assignedDoctor = availableDoctors[0];
        this.patient.assignedDoctor = assignedDoctor.id;
        assignedDoctor.currentPatients++;

        // Update localStorage
        const systemData = {
            patients: this.patients,
            hospitals: this.hospitals,
            doctors: this.doctors
        };
        localStorage.setItem('hospitalSystemData', JSON.stringify(systemData));

        // Update the display
        this.displayDoctorInfo();
        this.displayTreatmentTimeline();
        
        // Hide the allocate button
        document.getElementById('allocateDoctor').style.display = 'none';

        // Show success message
        alert(`Doctor ${assignedDoctor.name} has been successfully assigned to ${this.patient.name}!`);
    }

    printPatientDetails() {
        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        const patientData = this.generatePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patient Details - ${this.patient ? this.patient.name : 'Unknown'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #007BFF; padding-bottom: 20px; margin-bottom: 30px; }
                    .section { margin-bottom: 30px; }
                    .section h3 { color: #007BFF; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                    .info-item { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .label { font-weight: bold; color: #666; }
                    .value { color: #333; margin-top: 5px; }
                    .timeline { margin-top: 20px; }
                    .timeline-item { margin-bottom: 15px; padding-left: 20px; border-left: 2px solid #e9ecef; }
                    .timeline-date { font-weight: bold; color: #007BFF; }
                </style>
            </head>
            <body>
                ${patientData}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintContent() {
        if (!this.patient) return '<h1>Patient not found</h1>';

        const hospital = this.hospitals.find(h => h.id === this.patient.assignedHospital);
        const doctor = this.doctors.find(d => d.id === this.patient.assignedDoctor);

        return `
            <div class="header">
                <h1>Patient Medical Record</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="section">
                <h3>Patient Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Patient Name</div>
                        <div class="value">${this.patient.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Patient ID</div>
                        <div class="value">${this.patient.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Urgency Level</div>
                        <div class="value">${this.patient.urgency}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Days in Hospital</div>
                        <div class="value">${this.calculateDaysInHospital()}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Medical Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Condition</div>
                        <div class="value">${this.patient.ailment}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Required Specialization</div>
                        <div class="value">${this.patient.requiredSpecialization}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Admission Date</div>
                        <div class="value">${this.calculateAdmissionDate()}</div>
                    </div>
                </div>
            </div>

            ${this.patient.assignedHospital ? `
            <div class="section">
                <h3>Assignment Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Hospital</div>
                        <div class="value">${hospital ? hospital.name : 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Bed Number</div>
                        <div class="value">${this.patient.bedNumber || 'Not assigned'}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Travel Distance</div>
                        <div class="value">${this.patient.travelDistance.toFixed(1)} km</div>
                    </div>
                    ${doctor ? `
                    <div class="info-item">
                        <div class="label">Assigned Doctor</div>
                        <div class="value">${doctor.name}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h3>Treatment Timeline</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">${this.calculateAdmissionDate()}</div>
                        <div>Patient admitted to hospital system</div>
                    </div>
                    ${this.patient.assignedHospital ? `
                    <div class="timeline-item">
                        <div class="timeline-date">${this.calculateAssignmentTime()}</div>
                        <div>Assigned to ${hospital ? hospital.name : 'hospital'}</div>
                    </div>
                    ` : ''}
                    ${this.patient.assignedDoctor ? `
                    <div class="timeline-item">
                        <div class="timeline-date">${this.calculateDoctorAssignmentTime()}</div>
                        <div>Assigned to ${doctor ? doctor.name : 'doctor'}</div>
                    </div>
                    ` : ''}
                    <div class="timeline-item">
                        <div class="timeline-date">Current</div>
                        <div>${this.patient.assignedHospital ? 'Under treatment' : 'Waiting for assignment'}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the patient detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientDetailPage = new PatientDetailPage();
});
