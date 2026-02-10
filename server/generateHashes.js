import bcrypt from 'bcryptjs';

const password = 'password123';

async function generateHashes() {
    const userHash = await bcrypt.hash(password, 10);
    const adminHash = await bcrypt.hash(password, 10);

    console.log('User hash:', userHash);
    console.log('Admin hash:', adminHash);

    const testUsers = [
        {
            "id": "1707000000001",
            "name": "Aditi Sharma",
            "email": "aditi@example.com",
            "password": userHash,
            "role": "user",
            "createdAt": "2026-02-01T00:00:00.000Z"
        },
        {
            "id": "1707000000002",
            "name": "Admin User",
            "email": "admin@test.com",
            "password": adminHash,
            "role": "admin",
            "createdAt": "2026-02-01T00:00:00.000Z"
        }
    ];

    console.log('\nTest users JSON:');
    console.log(JSON.stringify(testUsers, null, 4));
}

generateHashes();
