// Configuration for different environments
const config = {
    development: {
        apiUrl: 'http://localhost:3000/api',
        environment: 'development'
    },
    production: {
        // Update these URLs after deploying your backend
        apiUrl: 'https://hospital-bed-respiratory-api.onrender.com/api', // Render
        // apiUrl: 'https://hospital-bed-respiratory-system.railway.app/api', // Railway
        // apiUrl: 'https://hospital-bed-respiratory-system.vercel.app/api', // Vercel
        environment: 'production'
    }
};

// Determine current environment
const currentEnv = window.location.hostname === 'localhost' ? 'development' : 'production';

// Export current configuration
window.appConfig = config[currentEnv];

// Log configuration
console.log(`🏥 Hospital System - Environment: ${window.appConfig.environment}`);
console.log(`🔗 API URL: ${window.appConfig.apiUrl}`);
