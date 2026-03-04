
import axios from 'axios';

async function testAuthMe() {
    const start = Date.now();
    try {
        const response = await axios.get('http://localhost:8000/api/auth/me', {
            headers: {
                'Authorization': 'Bearer test-token' // Token doesn't matter for connection speed test
            }
        });
        console.log(`Status: ${response.status}`);
    } catch (error) {
        console.log(`Status: ${error.response?.status || 'Error'}`);
    }
    console.log(`Time: ${Date.now() - start}ms`);
}

testAuthMe();
