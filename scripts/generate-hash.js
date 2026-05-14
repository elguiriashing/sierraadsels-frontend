// Generate bcrypt hash for password
const bcrypt = require('bcryptjs');

const password = 'Sierra2026';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);
console.log('Password:', password);
console.log('Hash:', hash);
console.log('');
console.log('Verify test:', bcrypt.compareSync(password, hash));
