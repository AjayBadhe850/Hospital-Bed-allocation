// API Communication Module
class HospitalAPI {
    constructor() {
        this.baseURL = window.appConfig ? window.appConfig.apiUrl : 'http://localhost:3000/api';
        this.isBackendAvailable = false;
        this.checkBackendHealth();
    }

    // Check if backend is available
    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                this.isBackendAvailable = true;
                console.log('✅ Backend API is available');
            } else {
                this.isBackendAvailable = false;
                console.log('⚠️ Backend API is not responding');
            }
        } catch (error) {
            this.isBackendAvailable = false;
            console.log('❌ Backend API is not available, using localStorage fallback');
        }
    }

    // Generic API request method
    async makeRequest(endpoint, options = {}) {
        if (!this.isBackendAvailable) {
            throw new Error('Backend API is not available');
        }

        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const requestOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Data Management
    async getAllData() {
        try {
            const response = await this.makeRequest('/data');
            return response.data;
        } catch (error) {
            console.error('Failed to load data from backend:', error);
            return this.getLocalStorageData();
        }
    }

    async saveAllData(data) {
        try {
            const response = await this.makeRequest('/data', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return response.data;
        } catch (error) {
            console.error('Failed to save data to backend:', error);
            this.saveToLocalStorage(data);
            return data;
        }
    }

    // Patient Management
    async getAllPatients() {
        try {
            const response = await this.makeRequest('/patients');
            return response.patients;
        } catch (error) {
            console.error('Failed to load patients from backend:', error);
            const data = this.getLocalStorageData();
            return data.patients || [];
        }
    }

    async getPatientById(id) {
        try {
            const response = await this.makeRequest(`/patients/${id}`);
            return response.patient;
        } catch (error) {
            console.error('Failed to load patient from backend:', error);
            const data = this.getLocalStorageData();
            return data.patients.find(p => p.id == id) || null;
        }
    }

    async createPatient(patientData) {
        try {
            const response = await this.makeRequest('/patients', {
                method: 'POST',
                body: JSON.stringify(patientData)
            });
            return response.patient;
        } catch (error) {
            console.error('Failed to create patient in backend:', error);
            // Fallback to localStorage
            const data = this.getLocalStorageData();
            const newId = data.patients.length > 0 ? Math.max(...data.patients.map(p => p.id)) + 1 : 1;
            const newPatient = { ...patientData, id: newId };
            data.patients.push(newPatient);
            this.saveToLocalStorage(data);
            return newPatient;
        }
    }

    async updatePatient(id, patientData) {
        try {
            const response = await this.makeRequest(`/patients/${id}`, {
                method: 'PUT',
                body: JSON.stringify(patientData)
            });
            return response.patient;
        } catch (error) {
            console.error('Failed to update patient in backend:', error);
            // Fallback to localStorage
            const data = this.getLocalStorageData();
            const patientIndex = data.patients.findIndex(p => p.id == id);
            if (patientIndex !== -1) {
                data.patients[patientIndex] = { ...data.patients[patientIndex], ...patientData };
                this.saveToLocalStorage(data);
                return data.patients[patientIndex];
            }
            throw new Error('Patient not found');
        }
    }

    async deletePatient(id) {
        try {
            const response = await this.makeRequest(`/patients/${id}`, {
                method: 'DELETE'
            });
            return response.patient;
        } catch (error) {
            console.error('Failed to delete patient in backend:', error);
            // Fallback to localStorage
            const data = this.getLocalStorageData();
            const patientIndex = data.patients.findIndex(p => p.id == id);
            if (patientIndex !== -1) {
                const deletedPatient = data.patients.splice(patientIndex, 1)[0];
                this.saveToLocalStorage(data);
                return deletedPatient;
            }
            throw new Error('Patient not found');
        }
    }

    async searchPatients(query) {
        try {
            const response = await this.makeRequest(`/patients/search/${encodeURIComponent(query)}`);
            return response.patients;
        } catch (error) {
            console.error('Failed to search patients in backend:', error);
            // Fallback to localStorage
            const data = this.getLocalStorageData();
            const queryLower = query.toLowerCase();
            return data.patients.filter(patient => 
                patient.name.toLowerCase().includes(queryLower)
            );
        }
    }

    // LocalStorage fallback methods
    getLocalStorageData() {
        try {
            const stored = localStorage.getItem('hospitalSystemData');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
        return { patients: [], hospitals: [], doctors: [] };
    }

    saveToLocalStorage(data) {
        try {
            localStorage.setItem('hospitalSystemData', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    // Sync data between backend and localStorage
    async syncData() {
        try {
            if (this.isBackendAvailable) {
                // Load from backend and save to localStorage as backup
                const backendData = await this.getAllData();
                this.saveToLocalStorage(backendData);
                return backendData;
            } else {
                // Use localStorage data
                return this.getLocalStorageData();
            }
        } catch (error) {
            console.error('Failed to sync data:', error);
            return this.getLocalStorageData();
        }
    }

    // Check if we should use backend or localStorage
    shouldUseBackend() {
        return this.isBackendAvailable;
    }

    // Get connection status
    getConnectionStatus() {
        return {
            backendAvailable: this.isBackendAvailable,
            mode: this.isBackendAvailable ? 'Backend API' : 'Local Storage',
            baseURL: this.baseURL
        };
    }
}

// Create global API instance
window.hospitalAPI = new HospitalAPI();
