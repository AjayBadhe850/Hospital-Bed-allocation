// Hospital Bed & Doctor Assignment System
// Main JavaScript file with optimization algorithms and visualization

class HospitalAssignmentSystem {
    constructor() {
        this.hospitals = [];
        this.patients = [];
        this.doctors = [];
        this.results = [];
        this.currentAlgorithm = 'all';
        
        this.initializeEventListeners();
        this.initialize();
    }

    // Initialize the system with data loading
    async initialize() {
        await this.loadData();
        this.renderVisualization();
        this.renderHospitalSymbols();
        this.updateAssignmentDisplay();
    }

    // Load data from backend or localStorage
    async loadData() {
        try {
            if (window.hospitalAPI && window.hospitalAPI.shouldUseBackend()) {
                console.log('🔄 Loading data from backend...');
                const data = await window.hospitalAPI.getAllData();
                this.patients = data.patients || [];
                this.hospitals = data.hospitals || [];
                this.doctors = data.doctors || [];
                console.log('✅ Data loaded from backend');
            } else {
                console.log('🔄 Loading data from localStorage...');
                const storedData = localStorage.getItem('hospitalSystemData');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    this.patients = data.patients || [];
                    this.hospitals = data.hospitals || [];
                    this.doctors = data.doctors || [];
                    console.log('✅ Data loaded from localStorage');
                } else {
                    console.log('🔄 No stored data found, generating sample data...');
                    this.generateSampleData();
                }
            }
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            console.log('🔄 Falling back to sample data generation...');
            this.generateSampleData();
        }
    }

    // Save data to backend or localStorage
    async saveData() {
        try {
            const data = {
                patients: this.patients,
                hospitals: this.hospitals,
                doctors: this.doctors
            };

            if (window.hospitalAPI && window.hospitalAPI.shouldUseBackend()) {
                console.log('💾 Saving data to backend...');
                await window.hospitalAPI.saveAllData(data);
                console.log('✅ Data saved to backend');
            } else {
                console.log('💾 Saving data to localStorage...');
                localStorage.setItem('hospitalSystemData', JSON.stringify(data));
                console.log('✅ Data saved to localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to save data:', error);
            // Fallback to localStorage
            const data = {
                patients: this.patients,
                hospitals: this.hospitals,
                doctors: this.doctors
            };
            localStorage.setItem('hospitalSystemData', JSON.stringify(data));
            console.log('✅ Data saved to localStorage as fallback');
        }
    }

    // Data Models and Structures
    createHospital(id, name, capacity, specialization, location) {
        return {
            id: id,
            name: name,
            capacity: capacity,
            currentPatients: 0,
            specialization: specialization,
            location: location,
            doctors: [],
            equipment: this.generateEquipment(specialization),
            utilization: 0,
            occupiedBeds: [],
            availableBeds: Array.from({length: capacity}, (_, i) => i + 1)
        };
    }

    createPatient(id, name, ailment, requiredSpecialization, urgency, location) {
        return {
            id: id,
            name: name,
            ailment: ailment,
            requiredSpecialization: requiredSpecialization,
            urgency: urgency, // 'critical', 'urgent', 'stable'
            location: location,
            assignedHospital: null,
            assignedDoctor: null,
            bedNumber: null,
            travelDistance: 0,
            waitTime: 0,
            admissionDate: new Date(),
            daysInHospital: 0
        };
    }

    createDoctor(id, name, specialization, hospitalId, experience) {
        return {
            id: id,
            name: name,
            specialization: specialization,
            hospitalId: hospitalId,
            experience: experience,
            currentPatients: 0,
            maxPatients: Math.floor(Math.random() * 5) + 3
        };
    }

    generateEquipment(specialization) {
        const equipmentMap = {
            'cardiology': ['ECG Machine', 'Defibrillator', 'Cardiac Monitor'],
            'neurology': ['MRI Scanner', 'EEG Machine', 'Neurological Tools'],
            'orthopedics': ['X-Ray Machine', 'Surgical Tools', 'Rehabilitation Equipment'],
            'emergency': ['Trauma Kit', 'Ventilator', 'Emergency Drugs'],
            'pediatrics': ['Pediatric Monitor', 'Child-Sized Equipment', 'Play Area']
        };
        return equipmentMap[specialization] || ['Basic Medical Equipment'];
    }

    // Event Listeners
    initializeEventListeners() {
        document.getElementById('generateData').addEventListener('click', () => {
            this.generateSampleData();
        });

        document.getElementById('runAllocation').addEventListener('click', () => {
            this.runAllocation();
        });

        document.getElementById('resetSimulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('algorithm').addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
        });

        // Urgency slider updates
        const urgencySliders = ['criticalUrgency', 'urgentUrgency', 'stableUrgency'];
        urgencySliders.forEach(sliderId => {
            document.getElementById(sliderId).addEventListener('input', (e) => {
                const value = e.target.value;
                const valueSpan = document.getElementById(sliderId.replace('Urgency', 'Value'));
                valueSpan.textContent = value + '%';
                this.updateUrgencyDistribution();
            });
        });

        document.getElementById('specializationMatch').addEventListener('input', (e) => {
            document.getElementById('specializationValue').textContent = e.target.value + '%';
        });

        // Assignment filter buttons
        document.getElementById('showAllAssignments').addEventListener('click', () => {
            this.updateAssignmentDisplay('all');
            this.setActiveFilter('showAllAssignments');
        });

        document.getElementById('showAssignedOnly').addEventListener('click', () => {
            this.updateAssignmentDisplay('assigned');
            this.setActiveFilter('showAssignedOnly');
        });

        document.getElementById('showUnassignedOnly').addEventListener('click', () => {
            this.updateAssignmentDisplay('unassigned');
            this.setActiveFilter('showUnassignedOnly');
        });

        // Search functionality
        document.getElementById('searchPatient').addEventListener('click', () => {
            this.searchPatients();
        });

        document.getElementById('patientSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPatients();
            }
        });

        document.getElementById('patientSearch').addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                this.showSearchSuggestions(e.target.value);
            } else {
                this.clearSearchResults();
            }
        });

        // List navigation buttons
        document.getElementById('viewPatients').addEventListener('click', () => {
            this.navigateToList('patients');
        });

        document.getElementById('viewDoctors').addEventListener('click', () => {
            this.navigateToList('doctors');
        });

        document.getElementById('viewHospitals').addEventListener('click', () => {
            this.navigateToList('hospitals');
        });

        document.getElementById('showBedsAvailability').addEventListener('click', () => {
            this.toggleBedsAvailability();
        });
    }

    updateUrgencyDistribution() {
        const critical = parseInt(document.getElementById('criticalUrgency').value);
        const urgent = parseInt(document.getElementById('urgentUrgency').value);
        const stable = parseInt(document.getElementById('stableUrgency').value);
        
        // Normalize to 100%
        const total = critical + urgent + stable;
        if (total !== 100) {
            const factor = 100 / total;
            document.getElementById('criticalUrgency').value = Math.round(critical * factor);
            document.getElementById('urgentUrgency').value = Math.round(urgent * factor);
            document.getElementById('stableUrgency').value = Math.round(stable * factor);
            
            document.getElementById('criticalValue').textContent = Math.round(critical * factor) + '%';
            document.getElementById('urgentValue').textContent = Math.round(urgent * factor) + '%';
            document.getElementById('stableValue').textContent = Math.round(stable * factor) + '%';
        }
    }

    // Sample Data Generation
    generateSampleData() {
        this.hospitals = [];
        this.patients = [];
        this.doctors = [];
        this.results = [];

        const hospitalCount = parseInt(document.getElementById('hospitalCount').value);
        const patientCount = parseInt(document.getElementById('patientCount').value);
        const doctorsPerHospital = parseInt(document.getElementById('doctorsPerHospital').value);
        const hospitalCapacity = parseInt(document.getElementById('hospitalCapacity').value);
        
        const specializations = ['cardiology', 'neurology', 'orthopedics', 'emergency', 'pediatrics'];
        const ailmentTypes = {
            'cardiology': ['Heart Attack', 'Arrhythmia', 'Chest Pain', 'Heart Failure', 'Angina', 'Cardiomyopathy'],
            'neurology': ['Stroke', 'Seizure', 'Headache', 'Memory Loss', 'Epilepsy', 'Migraine'],
            'orthopedics': ['Broken Bone', 'Joint Pain', 'Spinal Injury', 'Fracture', 'Arthritis', 'Torn Ligament'],
            'emergency': ['Trauma', 'Accident', 'Poisoning', 'Severe Bleeding', 'Burn Injury', 'Cardiac Arrest'],
            'pediatrics': ['Fever', 'Cough', 'Growth Issues', 'Childhood Illness', 'Asthma', 'Allergic Reaction']
        };

        // Doctor names database - Indian names
        const doctorNames = [
            'Dr. Nikhitha', 'Dr. Deekshitha', 'Dr. Srinivas', 'Dr. Dhana', 'Dr. Prince',
            'Dr. Vijay', 'Dr. Prasad', 'Dr. Chandra', 'Dr. Lokesh', 'Dr. Nikhitha Reddy',
            'Dr. Deekshitha Sharma', 'Dr. Srinivas Kumar', 'Dr. Dhana Raj', 'Dr. Prince Singh',
            'Dr. Vijay Kumar', 'Dr. Prasad Rao', 'Dr. Chandra Sekhar', 'Dr. Lokesh Reddy',
            'Dr. Nikhitha Patel', 'Dr. Deekshitha Gupta', 'Dr. Srinivas Sharma', 'Dr. Dhana Verma',
            'Dr. Prince Kumar', 'Dr. Vijay Singh', 'Dr. Prasad Reddy', 'Dr. Chandra Kumar',
            'Dr. Lokesh Sharma', 'Dr. Nikhitha Kumar', 'Dr. Deekshitha Reddy', 'Dr. Srinivas Patel'
        ];

        // Patient names database - Indian names
        const patientNames = [
            'Ajay', 'Teja', 'Dileep', 'Hari Krishna', 'Rithwik', 'Madhu', 'Prudhvi',
            'Ajay Kumar', 'Teja Reddy', 'Dileep Sharma', 'Hari Krishna Singh', 'Rithwik Patel',
            'Madhu Gupta', 'Prudhvi Verma', 'Ajay Singh', 'Teja Kumar', 'Dileep Reddy',
            'Hari Krishna Sharma', 'Rithwik Kumar', 'Madhu Patel', 'Prudhvi Singh',
            'Ajay Patel', 'Teja Sharma', 'Dileep Kumar', 'Hari Krishna Reddy', 'Rithwik Singh',
            'Madhu Kumar', 'Prudhvi Patel', 'Ajay Sharma', 'Teja Kumar', 'Dileep Singh',
            'Hari Krishna Patel', 'Rithwik Sharma', 'Madhu Singh', 'Prudhvi Kumar',
            'Ajay Reddy', 'Teja Singh', 'Dileep Patel', 'Hari Krishna Kumar', 'Rithwik Reddy',
            'Madhu Sharma', 'Prudhvi Reddy', 'Ajay Verma', 'Teja Patel', 'Dileep Singh',
            'Hari Krishna Verma', 'Rithwik Verma', 'Madhu Reddy', 'Prudhvi Sharma'
        ];

        // Hospital names database - Mix of Indian and International names
        const hospitalNames = [
            'Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'Manipal Hospitals',
            'Narayana Health', 'AIIMS Delhi', 'Tata Memorial Hospital', 'KIMS Hospital',
            'City General Hospital', 'Metropolitan Medical Center', 'Regional Health Center',
            'University Hospital', 'Community Medical Center', 'Central Hospital',
            'St. Mary\'s Hospital', 'Memorial Medical Center', 'Valley General Hospital',
            'Riverside Medical Center', 'Sunset Hospital', 'Oakwood Medical Center'
        ];

        // Generate Hospitals
        for (let i = 0; i < hospitalCount; i++) {
            const specialization = specializations[i % specializations.length];
            const hospitalName = hospitalNames[i] || `Hospital ${String.fromCharCode(65 + i)}`;
            const hospital = this.createHospital(
                i,
                hospitalName,
                hospitalCapacity + Math.floor(Math.random() * 10) - 5,
                specialization,
                { x: Math.random() * 100, y: Math.random() * 100 }
            );
            this.hospitals.push(hospital);
        }

        // Generate Doctors
        let doctorId = 0;
        this.hospitals.forEach(hospital => {
            for (let i = 0; i < doctorsPerHospital; i++) {
                const doctorName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
                
                const doctor = this.createDoctor(
                    doctorId++,
                    doctorName,
                    hospital.specialization,
                    hospital.id,
                    Math.floor(Math.random() * 20) + 1
                );
                this.doctors.push(doctor);
                hospital.doctors.push(doctor);
            }
        });

        // Generate Patients
        const criticalPercent = parseInt(document.getElementById('criticalUrgency').value);
        const urgentPercent = parseInt(document.getElementById('urgentUrgency').value);
        const stablePercent = parseInt(document.getElementById('stableUrgency').value);

        for (let i = 0; i < patientCount; i++) {
            const specialization = specializations[Math.floor(Math.random() * specializations.length)];
            const ailment = ailmentTypes[specialization][Math.floor(Math.random() * ailmentTypes[specialization].length)];
            
            // Determine urgency based on percentages
            let urgency;
            const rand = Math.random() * 100;
            if (rand < criticalPercent) urgency = 'critical';
            else if (rand < criticalPercent + urgentPercent) urgency = 'urgent';
            else urgency = 'stable';

            // Generate patient name
            const patientName = patientNames[Math.floor(Math.random() * patientNames.length)];

            const patient = this.createPatient(
                i,
                patientName,
                ailment,
                specialization,
                urgency,
                { x: Math.random() * 100, y: Math.random() * 100 }
            );
            this.patients.push(patient);
        }

        this.updateDaysInHospital();
        this.saveData(); // Save generated data
        this.renderVisualization();
        this.renderHospitalSymbols();
        this.updateAssignmentDisplay();
        this.clearResults();
    }

    // Distance Calculation
    calculateDistance(location1, location2) {
        const dx = location1.x - location2.x;
        const dy = location1.y - location2.y;
        return Math.sqrt(dx * dx + dy * dy) * 10; // Scale to km
    }

    // Optimization Algorithms

    // 1. Greedy Matching Algorithm
    greedyMatching() {
        const startTime = performance.now();
        const assignments = [];
        const availableHospitals = [...this.hospitals];
        
        // Sort patients by urgency (critical first)
        const sortedPatients = [...this.patients].sort((a, b) => {
            const urgencyOrder = { 'critical': 3, 'urgent': 2, 'stable': 1 };
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        });

        for (const patient of sortedPatients) {
            let bestHospital = null;
            let bestDistance = Infinity;
            let bestIndex = -1;

            // Find the best available hospital
            for (let i = 0; i < availableHospitals.length; i++) {
                const hospital = availableHospitals[i];
                
                // Check if hospital has capacity and matching specialization
                if (hospital.currentPatients < hospital.capacity && 
                    hospital.specialization === patient.requiredSpecialization) {
                    
                    const distance = this.calculateDistance(patient.location, hospital.location);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestHospital = hospital;
                        bestIndex = i;
                    }
                }
            }

            if (bestHospital) {
                // Assign patient to hospital
                patient.assignedHospital = bestHospital.id;
                patient.travelDistance = bestDistance;
                
                // Assign bed
                if (bestHospital.availableBeds.length > 0) {
                    patient.bedNumber = bestHospital.availableBeds.shift();
                    bestHospital.occupiedBeds.push(patient.bedNumber);
                }
                
                // Assign doctor
                const availableDoctors = bestHospital.doctors.filter(d => d.currentPatients < d.maxPatients);
                if (availableDoctors.length > 0) {
                    const assignedDoctor = availableDoctors[0];
                    patient.assignedDoctor = assignedDoctor.id;
                    assignedDoctor.currentPatients++;
                }
                
                bestHospital.currentPatients++;
                bestHospital.utilization = (bestHospital.currentPatients / bestHospital.capacity) * 100;
                
                assignments.push({
                    patientId: patient.id,
                    hospitalId: bestHospital.id,
                    distance: bestDistance,
                    bedNumber: patient.bedNumber,
                    doctorId: patient.assignedDoctor
                });

                // Remove hospital if full
                if (bestHospital.currentPatients >= bestHospital.capacity) {
                    availableHospitals.splice(bestIndex, 1);
                }
            }
        }

        const endTime = performance.now();
        const assignedCount = assignments.length;
        const avgDistance = assignments.reduce((sum, a) => sum + a.distance, 0) / assignedCount;
        const totalUtilization = this.hospitals.reduce((sum, h) => sum + h.utilization, 0) / this.hospitals.length;

        return {
            algorithm: 'Greedy Matching',
            executionTime: endTime - startTime,
            patientsAssigned: assignedCount,
            avgDistance: avgDistance,
            utilization: totalUtilization,
            assignments: assignments,
            efficiencyScore: this.calculateEfficiencyScore(assignedCount, avgDistance, totalUtilization)
        };
    }

    // 2. Knapsack Dynamic Programming Algorithm
    knapsackDP() {
        const startTime = performance.now();
        const assignments = [];
        
        // Reset hospital states
        this.hospitals.forEach(h => {
            h.currentPatients = 0;
            h.utilization = 0;
        });

        // Group patients by specialization
        const patientsBySpecialization = {};
        this.patients.forEach(patient => {
            if (!patientsBySpecialization[patient.requiredSpecialization]) {
                patientsBySpecialization[patient.requiredSpecialization] = [];
            }
            patientsBySpecialization[patient.requiredSpecialization].push(patient);
        });

        // Process each specialization separately
        Object.keys(patientsBySpecialization).forEach(specialization => {
            const patients = patientsBySpecialization[specialization];
            const hospitals = this.hospitals.filter(h => h.specialization === specialization);
            
            if (hospitals.length === 0) return;

            // Sort patients by urgency and distance to nearest hospital
            patients.sort((a, b) => {
                const urgencyOrder = { 'critical': 3, 'urgent': 2, 'stable': 1 };
                if (urgencyOrder[b.urgency] !== urgencyOrder[a.urgency]) {
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                }
                
                const minDistA = Math.min(...hospitals.map(h => this.calculateDistance(a.location, h.location)));
                const minDistB = Math.min(...hospitals.map(h => this.calculateDistance(b.location, h.location)));
                return minDistA - minDistB;
            });

            // Use knapsack approach for each hospital
            hospitals.forEach(hospital => {
                const capacity = hospital.capacity;
                const availablePatients = patients.filter(p => !p.assignedHospital);
                
                if (availablePatients.length === 0) return;

                // Create distance matrix
                const distances = availablePatients.map(patient => 
                    this.calculateDistance(patient.location, hospital.location)
                );

                // Knapsack DP: maximize value (urgency) while minimizing weight (distance)
                const dp = Array(capacity + 1).fill(null).map(() => ({
                    value: 0,
                    patients: []
                }));

                for (let i = 0; i < availablePatients.length; i++) {
                    const patient = availablePatients[i];
                    const urgencyValue = { 'critical': 3, 'urgent': 2, 'stable': 1 }[patient.urgency];
                    const distance = distances[i];

                    for (let w = capacity; w >= 1; w--) {
                        const newValue = dp[w - 1].value + urgencyValue;
                        const newDistance = dp[w - 1].patients.reduce((sum, p) => sum + p.distance, 0) + distance;
                        
                        if (newValue > dp[w].value || 
                            (newValue === dp[w].value && newDistance < dp[w].patients.reduce((sum, p) => sum + p.distance, 0))) {
                            dp[w] = {
                                value: newValue,
                                patients: [...dp[w - 1].patients, { patient, distance }]
                            };
                        }
                    }
                }

                // Assign patients from optimal solution
                const optimalSolution = dp[capacity];
                optimalSolution.patients.forEach(({ patient, distance }) => {
                    patient.assignedHospital = hospital.id;
                    patient.travelDistance = distance;
                    hospital.currentPatients++;
                    
                    assignments.push({
                        patientId: patient.id,
                        hospitalId: hospital.id,
                        distance: distance
                    });
                });

                hospital.utilization = (hospital.currentPatients / hospital.capacity) * 100;
            });
        });

        const endTime = performance.now();
        const assignedCount = assignments.length;
        const avgDistance = assignments.reduce((sum, a) => sum + a.distance, 0) / assignedCount;
        const totalUtilization = this.hospitals.reduce((sum, h) => sum + h.utilization, 0) / this.hospitals.length;

        return {
            algorithm: 'Knapsack DP',
            executionTime: endTime - startTime,
            patientsAssigned: assignedCount,
            avgDistance: avgDistance,
            utilization: totalUtilization,
            assignments: assignments,
            efficiencyScore: this.calculateEfficiencyScore(assignedCount, avgDistance, totalUtilization)
        };
    }

    // 3. Branch & Bound Algorithm
    branchAndBound() {
        const startTime = performance.now();
        
        // Reset hospital states
        this.hospitals.forEach(h => {
            h.currentPatients = 0;
            h.utilization = 0;
        });

        // Create all possible assignments
        const allAssignments = [];
        this.patients.forEach(patient => {
            this.hospitals.forEach(hospital => {
                if (hospital.specialization === patient.requiredSpecialization) {
                    const distance = this.calculateDistance(patient.location, hospital.location);
                    allAssignments.push({
                        patientId: patient.id,
                        hospitalId: hospital.id,
                        distance: distance,
                        urgency: patient.urgency
                    });
                }
            });
        });

        // Branch & Bound to find optimal solution
        let bestSolution = null;
        let bestCost = Infinity;

        const solve = (remainingPatients, currentAssignments, currentCost, hospitalStates) => {
            // Bound: if current cost is already worse than best, prune
            if (currentCost >= bestCost) return;

            // Base case: all patients assigned
            if (remainingPatients.length === 0) {
                if (currentCost < bestCost) {
                    bestCost = currentCost;
                    bestSolution = [...currentAssignments];
                }
                return;
            }

            const patient = remainingPatients[0];
            const newRemainingPatients = remainingPatients.slice(1);

            // Try assigning to each compatible hospital
            for (const assignment of allAssignments) {
                if (assignment.patientId === patient.id) {
                    const hospital = this.hospitals.find(h => h.id === assignment.hospitalId);
                    const newHospitalStates = [...hospitalStates];
                    const hospitalIndex = newHospitalStates.findIndex(h => h.id === hospital.id);
                    
                    // Check capacity constraint
                    if (newHospitalStates[hospitalIndex].currentPatients < newHospitalStates[hospitalIndex].capacity) {
                        newHospitalStates[hospitalIndex].currentPatients++;
                        
                        const newAssignments = [...currentAssignments, assignment];
                        const urgencyWeight = { 'critical': 3, 'urgent': 2, 'stable': 1 }[assignment.urgency];
                        const newCost = currentCost + assignment.distance - urgencyWeight * 10; // Reward urgency
                        
                        solve(newRemainingPatients, newAssignments, newCost, newHospitalStates);
                    }
                }
            }
        };

        // Initialize hospital states
        const initialHospitalStates = this.hospitals.map(h => ({ ...h, currentPatients: 0 }));
        
        // Start with patients sorted by urgency
        const sortedPatients = [...this.patients].sort((a, b) => {
            const urgencyOrder = { 'critical': 3, 'urgent': 2, 'stable': 1 };
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        });

        solve(sortedPatients, [], 0, initialHospitalStates);

        // Apply the best solution
        if (bestSolution) {
            bestSolution.forEach(assignment => {
                const patient = this.patients.find(p => p.id === assignment.patientId);
                const hospital = this.hospitals.find(h => h.id === assignment.hospitalId);
                
                patient.assignedHospital = assignment.hospitalId;
                patient.travelDistance = assignment.distance;
                hospital.currentPatients++;
                hospital.utilization = (hospital.currentPatients / hospital.capacity) * 100;
            });
        }

        const endTime = performance.now();
        const assignedCount = bestSolution ? bestSolution.length : 0;
        const avgDistance = bestSolution ? bestSolution.reduce((sum, a) => sum + a.distance, 0) / assignedCount : 0;
        const totalUtilization = this.hospitals.reduce((sum, h) => sum + h.utilization, 0) / this.hospitals.length;

        return {
            algorithm: 'Branch & Bound',
            executionTime: endTime - startTime,
            patientsAssigned: assignedCount,
            avgDistance: avgDistance,
            utilization: totalUtilization,
            assignments: bestSolution || [],
            efficiencyScore: this.calculateEfficiencyScore(assignedCount, avgDistance, totalUtilization)
        };
    }

    // Helper Methods
    calculateEfficiencyScore(assignedCount, avgDistance, utilization) {
        const assignmentRate = assignedCount / this.patients.length;
        const distanceScore = Math.max(0, 1 - (avgDistance / 50)); // Normalize distance
        const utilizationScore = utilization / 100;
        
        return Math.round((assignmentRate * 0.4 + distanceScore * 0.3 + utilizationScore * 0.3) * 100);
    }

    // Main Allocation Runner
    async runAllocation() {
        this.showLoading(true);
        
        // Reset all assignments
        this.patients.forEach(p => {
            p.assignedHospital = null;
            p.travelDistance = 0;
        });
        this.hospitals.forEach(h => {
            h.currentPatients = 0;
            h.utilization = 0;
        });

        this.results = [];

        try {
            if (this.currentAlgorithm === 'all' || this.currentAlgorithm === 'greedy') {
                await this.delay(100);
                const greedyResult = this.greedyMatching();
                this.results.push(greedyResult);
                await this.animateResult(greedyResult, 'greedy');
            }

            if (this.currentAlgorithm === 'all' || this.currentAlgorithm === 'knapsack') {
                await this.delay(100);
                const knapsackResult = this.knapsackDP();
                this.results.push(knapsackResult);
                await this.animateResult(knapsackResult, 'knapsack');
            }

            if (this.currentAlgorithm === 'all' || this.currentAlgorithm === 'branch-bound') {
                await this.delay(100);
                const branchBoundResult = this.branchAndBound();
                this.results.push(branchBoundResult);
                await this.animateResult(branchBoundResult, 'branch-bound');
            }

            this.saveData(); // Save allocation results
            this.displayResults();
        } catch (error) {
            console.error('Error during allocation:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // Visualization Methods
    renderVisualization() {
        this.renderPatients();
        this.renderHospitals();
    }

    renderPatients() {
        const container = document.getElementById('patientsContainer');
        container.innerHTML = '';

        this.patients.forEach(patient => {
            const patientElement = document.createElement('div');
            patientElement.className = `patient-icon ${patient.urgency}`;
            patientElement.id = `patient-${patient.id}`;
            patientElement.innerHTML = `
                <i class="fas fa-user"></i>
                <div class="patient-name">${patient.name.split(' ')[0]}</div>
            `;
            
            let tooltipText = `${patient.name}\n${patient.ailment}\nUrgency: ${patient.urgency}`;
            if (patient.assignedHospital !== null) {
                const hospital = this.hospitals.find(h => h.id === patient.assignedHospital);
                const doctor = this.doctors.find(d => d.id === patient.assignedDoctor);
                tooltipText += `\nAssigned to: ${hospital ? hospital.name : 'Unknown'}`;
                if (patient.bedNumber) tooltipText += `\nBed: ${patient.bedNumber}`;
                if (doctor) tooltipText += `\nDoctor: ${doctor.name}`;
            }
            
            patientElement.title = tooltipText;
            container.appendChild(patientElement);
        });
    }

    renderHospitals() {
        const container = document.getElementById('hospitalsContainer');
        container.innerHTML = '';

        this.hospitals.forEach(hospital => {
            const hospitalElement = document.createElement('div');
            hospitalElement.className = 'hospital-icon available';
            hospitalElement.id = `hospital-${hospital.id}`;
            hospitalElement.innerHTML = `
                <i class="fas fa-hospital"></i>
                <div class="hospital-name">${hospital.name.split(' ')[0]}</div>
                <div class="hospital-capacity">${hospital.currentPatients}/${hospital.capacity}</div>
            `;
            
            let tooltipText = `${hospital.name}\nSpecialization: ${hospital.specialization}\nCapacity: ${hospital.capacity} beds\nCurrent Patients: ${hospital.currentPatients}`;
            if (hospital.doctors.length > 0) {
                tooltipText += `\nDoctors: ${hospital.doctors.map(d => d.name).join(', ')}`;
            }
            if (hospital.occupiedBeds.length > 0) {
                tooltipText += `\nOccupied Beds: ${hospital.occupiedBeds.join(', ')}`;
            }
            
            hospitalElement.title = tooltipText;
            container.appendChild(hospitalElement);
        });
    }

    async animateResult(result, algorithmType) {
        // Clear previous assignments
        this.patients.forEach(p => {
            p.assignedHospital = null;
            p.travelDistance = 0;
        });
        this.hospitals.forEach(h => {
            h.currentPatients = 0;
            h.utilization = 0;
        });

        // Reset visual states
        document.querySelectorAll('.patient-icon').forEach(el => {
            el.classList.remove('assigned');
        });
        document.querySelectorAll('.hospital-icon').forEach(el => {
            el.className = 'hospital-icon available';
        });

        // Animate assignments
        for (const assignment of result.assignments) {
            const patient = this.patients.find(p => p.id === assignment.patientId);
            const hospital = this.hospitals.find(h => h.id === assignment.hospitalId);
            
            if (patient && hospital) {
                patient.assignedHospital = assignment.hospitalId;
                patient.travelDistance = assignment.distance;
                hospital.currentPatients++;
                hospital.utilization = (hospital.currentPatients / hospital.capacity) * 100;

                // Visual updates
                const patientElement = document.getElementById(`patient-${patient.id}`);
                const hospitalElement = document.getElementById(`hospital-${hospital.id}`);
                
                if (patientElement && hospitalElement) {
                    // Animate ambulance
                    this.animateAmbulance(patientElement, hospitalElement);
                    
                    // Update patient status
                    patientElement.classList.add('assigned');
                    
                    // Update hospital status
                    const utilization = hospital.utilization;
                    if (utilization >= 100) {
                        hospitalElement.className = 'hospital-icon full';
                    } else if (utilization >= 70) {
                        hospitalElement.className = 'hospital-icon filling';
                    }
                    
                    // Update capacity display
                    hospitalElement.querySelector('.hospital-capacity').textContent = 
                        `${hospital.currentPatients}/${hospital.capacity}`;
                }
            }
            
            await this.delay(200);
        }
    }

    animateAmbulance(fromElement, toElement) {
        const ambulance = document.createElement('div');
        ambulance.className = 'ambulance';
        ambulance.innerHTML = '<i class="fas fa-ambulance"></i>';
        
        const container = document.getElementById('ambulanceContainer');
        container.appendChild(ambulance);

        // Position ambulance
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const startX = fromRect.left - containerRect.left;
        const startY = fromRect.top - containerRect.top;
        const endX = toRect.left - containerRect.left;
        const endY = toRect.top - containerRect.top;
        
        ambulance.style.left = startX + 'px';
        ambulance.style.top = startY + 'px';
        
        // Animate movement
        setTimeout(() => {
            ambulance.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
        }, 50);

        // Remove ambulance after animation
        setTimeout(() => {
            if (ambulance.parentNode) {
                ambulance.parentNode.removeChild(ambulance);
            }
        }, 2000);
    }

    // Results Display
    displayResults() {
        const tbody = document.getElementById('resultsBody');
        tbody.innerHTML = '';

        this.results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${result.algorithm}</strong></td>
                <td>${result.executionTime.toFixed(2)} ms</td>
                <td>${result.patientsAssigned}/${this.patients.length} (${Math.round(result.patientsAssigned/this.patients.length*100)}%)</td>
                <td>${result.avgDistance.toFixed(1)} km</td>
                <td>${result.utilization.toFixed(1)}%</td>
                <td><span class="efficiency-score">${result.efficiencyScore}%</span></td>
            `;
            tbody.appendChild(row);
        });

        this.updateCharts();
    }

    updateCharts() {
        this.updateTimeChart();
        this.updateEfficiencyChart();
    }

    updateTimeChart() {
        const chart = document.getElementById('timeChart');
        chart.innerHTML = '';

        this.results.forEach(result => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            
            const maxTime = Math.max(...this.results.map(r => r.executionTime));
            const width = (result.executionTime / maxTime) * 100;
            
            bar.innerHTML = `
                <div class="chart-bar-label">${result.algorithm}</div>
                <div class="chart-bar-fill" style="width: ${width}%"></div>
                <span>${result.executionTime.toFixed(1)}ms</span>
            `;
            chart.appendChild(bar);
        });
    }

    updateEfficiencyChart() {
        const chart = document.getElementById('efficiencyChart');
        chart.innerHTML = '';

        this.results.forEach(result => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            
            const maxEfficiency = Math.max(...this.results.map(r => r.efficiencyScore));
            const width = (result.efficiencyScore / maxEfficiency) * 100;
            
            bar.innerHTML = `
                <div class="chart-bar-label">${result.algorithm}</div>
                <div class="chart-bar-fill" style="width: ${width}%"></div>
                <span>${result.efficiencyScore}%</span>
            `;
            chart.appendChild(bar);
        });
    }

    // Utility Methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    resetSimulation() {
        this.patients.forEach(p => {
            p.assignedHospital = null;
            p.travelDistance = 0;
        });
        this.hospitals.forEach(h => {
            h.currentPatients = 0;
            h.utilization = 0;
        });
        
        this.saveData(); // Save reset data
        this.renderVisualization();
        this.updateAssignmentDisplay();
        this.clearResults();
    }

    clearResults() {
        document.getElementById('resultsBody').innerHTML = '';
        document.getElementById('timeChart').innerHTML = '';
        document.getElementById('efficiencyChart').innerHTML = '';
        this.results = [];
    }

    // Assignment Display Methods
    updateAssignmentDisplay(filter = 'all') {
        const container = document.getElementById('assignmentList');
        container.innerHTML = '';

        let patientsToShow = this.patients;
        if (filter === 'assigned') {
            patientsToShow = this.patients.filter(p => p.assignedHospital !== null);
        } else if (filter === 'unassigned') {
            patientsToShow = this.patients.filter(p => p.assignedHospital === null);
        }

        patientsToShow.forEach(patient => {
            const card = this.createAssignmentCard(patient);
            container.appendChild(card);
        });
    }

    createAssignmentCard(patient) {
        const card = document.createElement('div');
        card.className = `assignment-card ${patient.urgency} ${patient.assignedHospital !== null ? 'assigned' : 'unassigned'}`;

        const hospital = patient.assignedHospital !== null ? 
            this.hospitals.find(h => h.id === patient.assignedHospital) : null;
        const doctor = patient.assignedDoctor !== null ? 
            this.doctors.find(d => d.id === patient.assignedDoctor) : null;

        let assignmentInfo = '';
        if (patient.assignedHospital !== null && hospital) {
            assignmentInfo = `
                <div class="assignment-info">
                    <strong>🏥 Hospital:</strong> ${hospital.name}<br>
                    ${patient.bedNumber ? `<strong>🛏️ Bed:</strong> ${patient.bedNumber}<br>` : ''}
                    ${doctor ? `<strong>👨‍⚕️ Doctor:</strong> ${doctor.name}<br>` : ''}
                    <strong>📏 Distance:</strong> ${patient.travelDistance.toFixed(1)} km
                </div>
            `;
        } else {
            assignmentInfo = '<div class="assignment-info unassigned">❌ Not assigned to any hospital</div>';
        }

        card.innerHTML = `
            <div class="patient-info">
                <div class="patient-name">${patient.name}</div>
                <div class="urgency-badge ${patient.urgency}">${patient.urgency}</div>
            </div>
            <div class="ailment-info">
                <strong>Condition:</strong> ${patient.ailment}<br>
                <strong>Specialization:</strong> ${patient.requiredSpecialization}
            </div>
            ${assignmentInfo}
        `;

        return card;
    }

    setActiveFilter(activeId) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.assignment-filters .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        document.getElementById(activeId).classList.add('active');
    }

    // Search Methods
    searchPatients() {
        const searchTerm = document.getElementById('patientSearch').value.trim().toLowerCase();
        if (!searchTerm) {
            this.clearSearchResults();
            return;
        }

        const matchingPatients = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm)
        );

        this.displaySearchResults(matchingPatients);
    }

    showSearchSuggestions(searchTerm) {
        const matchingPatients = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Show max 5 suggestions

        this.displaySearchResults(matchingPatients);
    }

    displaySearchResults(patients) {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';

        if (patients.length === 0) {
            container.innerHTML = '<div class="search-result-item">No patients found</div>';
            return;
        }

        patients.forEach(patient => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            const hospital = patient.assignedHospital !== null ? 
                this.hospitals.find(h => h.id === patient.assignedHospital) : null;
            const doctor = patient.assignedDoctor !== null ? 
                this.doctors.find(d => d.id === patient.assignedDoctor) : null;

            resultItem.innerHTML = `
                <div>
                    <div class="search-result-name">${patient.name}</div>
                    <div class="search-result-details">
                        ${patient.ailment} • ${patient.urgency} • 
                        ${hospital ? hospital.name : 'Not assigned'}
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="hospitalSystem.viewPatientDetails(${patient.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            `;

            container.appendChild(resultItem);
        });
    }

    clearSearchResults() {
        document.getElementById('searchResults').innerHTML = '';
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

    // Update days in hospital for all patients
    updateDaysInHospital() {
        const currentDate = new Date();
        this.patients.forEach(patient => {
            const timeDiff = currentDate.getTime() - patient.admissionDate.getTime();
            patient.daysInHospital = Math.floor(timeDiff / (1000 * 3600 * 24));
        });
    }

    // Navigate to list pages
    navigateToList(listType) {
        // Store current data in localStorage for the list pages
        const systemData = {
            patients: this.patients,
            hospitals: this.hospitals,
            doctors: this.doctors
        };
        localStorage.setItem('hospitalSystemData', JSON.stringify(systemData));

        // Navigate to appropriate list page
        switch(listType) {
            case 'patients':
                window.location.href = 'patients-list.html';
                break;
            case 'doctors':
                window.location.href = 'doctors-list.html';
                break;
            case 'hospitals':
                window.location.href = 'hospitals-list.html';
                break;
        }
    }

    // Doctor allocation functionality
    allocateDoctorToPatient(patientId) {
        const patient = this.patients.find(p => p.id == patientId);
        if (!patient) return false;

        // Find available doctors with matching specialization
        const availableDoctors = this.doctors.filter(doctor => 
            doctor.specialization === patient.requiredSpecialization && 
            doctor.currentPatients < doctor.maxPatients
        );

        if (availableDoctors.length === 0) {
            return false; // No available doctors
        }

        // Sort doctors by experience and current patient load (prioritize experienced doctors with fewer patients)
        availableDoctors.sort((a, b) => {
            const aScore = a.experience - (a.currentPatients / a.maxPatients) * 10;
            const bScore = b.experience - (b.currentPatients / b.maxPatients) * 10;
            return bScore - aScore;
        });

        // Assign the best doctor
        const assignedDoctor = availableDoctors[0];
        patient.assignedDoctor = assignedDoctor.id;
        assignedDoctor.currentPatients++;

        // Update localStorage
        const systemData = {
            patients: this.patients,
            hospitals: this.hospitals,
            doctors: this.doctors
        };
        localStorage.setItem('hospitalSystemData', JSON.stringify(systemData));

        return true;
    }

    // Beds Availability Methods
    toggleBedsAvailability() {
        const bedsSection = document.getElementById('bedsAvailability');
        const button = document.getElementById('showBedsAvailability');
        
        if (bedsSection.style.display === 'none') {
            this.displayBedsAvailability();
            bedsSection.style.display = 'block';
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Beds Availability';
            button.classList.remove('btn-warning');
            button.classList.add('btn-secondary');
        } else {
            bedsSection.style.display = 'none';
            button.innerHTML = '<i class="fas fa-bed"></i> Show Beds Availability';
            button.classList.remove('btn-secondary');
            button.classList.add('btn-warning');
        }
    }

    displayBedsAvailability() {
        const container = document.getElementById('bedsGrid');
        container.innerHTML = '';

        this.hospitals.forEach(hospital => {
            const card = this.createBedCard(hospital);
            container.appendChild(card);
        });
    }

    createBedCard(hospital) {
        const card = document.createElement('div');
        const availableBeds = hospital.capacity - hospital.currentPatients;
        const utilization = (hospital.currentPatients / hospital.capacity) * 100;
        
        let statusClass = 'available';
        let statusIcon = 'fas fa-bed';
        let statusText = 'Available';
        
        if (utilization >= 100) {
            statusClass = 'full';
            statusIcon = 'fas fa-ban';
            statusText = 'Full';
        } else if (utilization >= 70) {
            statusClass = 'filling';
            statusIcon = 'fas fa-exclamation-triangle';
            statusText = 'Filling';
        }

        card.className = `bed-card ${statusClass}`;

        card.innerHTML = `
            <div class="bed-header">
                <div class="bed-icon ${statusClass}">
                    <i class="${statusIcon}"></i>
                </div>
                <div class="bed-title">
                    <h3>${hospital.name}</h3>
                    <p>${hospital.specialization} • ${statusText}</p>
                </div>
            </div>
            <div class="bed-stats">
                <div class="bed-stat">
                    <span class="bed-stat-label">Total Beds:</span>
                    <span class="bed-stat-value">${hospital.capacity}</span>
                </div>
                <div class="bed-stat">
                    <span class="bed-stat-label">Occupied:</span>
                    <span class="bed-stat-value">${hospital.currentPatients}</span>
                </div>
                <div class="bed-stat">
                    <span class="bed-stat-label">Available:</span>
                    <span class="bed-stat-value">${availableBeds}</span>
                </div>
                <div class="bed-stat">
                    <span class="bed-stat-label">Utilization:</span>
                    <span class="bed-stat-value">${utilization.toFixed(1)}%</span>
                </div>
            </div>
            <div class="bed-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${statusClass}" style="width: ${utilization}%"></div>
                </div>
            </div>
        `;

        return card;
    }

    // Hospital Symbols Methods
    renderHospitalSymbols() {
        const container = document.getElementById('hospitalSymbols');
        container.innerHTML = '';

        this.hospitals.forEach(hospital => {
            const symbol = this.createHospitalSymbol(hospital);
            container.appendChild(symbol);
        });
    }

    createHospitalSymbol(hospital) {
        const symbol = document.createElement('div');
        const utilization = (hospital.currentPatients / hospital.capacity) * 100;
        
        let statusClass = 'available';
        if (utilization >= 100) {
            statusClass = 'full';
        } else if (utilization >= 70) {
            statusClass = 'filling';
        }

        symbol.className = `hospital-symbol ${statusClass}`;
        symbol.innerHTML = `<i class="fas fa-hospital"></i>`;
        symbol.title = `${hospital.name}\n${hospital.specialization}\n${hospital.currentPatients}/${hospital.capacity} beds\n${utilization.toFixed(1)}% utilization`;

        // Add click event to navigate to hospital detail page
        symbol.addEventListener('click', () => {
            this.viewHospitalDetails(hospital.id);
        });

        return symbol;
    }

    viewHospitalDetails(hospitalId) {
        // Store current data in localStorage for the hospital detail page
        const systemData = {
            patients: this.patients,
            hospitals: this.hospitals,
            doctors: this.doctors
        };
        localStorage.setItem('hospitalSystemData', JSON.stringify(systemData));

        // Navigate to hospital detail page
        window.location.href = `hospital-detail.html?id=${hospitalId}`;
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hospitalSystem = new HospitalAssignmentSystem();
});

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    document.getElementById('runAllocation').click();
                    break;
                case 'g':
                    e.preventDefault();
                    document.getElementById('generateData').click();
                    break;
                case 'Escape':
                    e.preventDefault();
                    document.getElementById('resetSimulation').click();
                    break;
            }
        }
    });

    // Add tooltips for better user guidance
    const tooltips = {
        'generateData': 'Generate random sample data for testing (Ctrl+G)',
        'runAllocation': 'Run the optimization algorithms (Ctrl+R)',
        'resetSimulation': 'Reset the simulation (Escape)',
        'algorithm': 'Choose which algorithm to run or compare all'
    };

    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
});
