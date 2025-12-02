import bcrypt from 'bcryptjs';

const password = 'Admin@123456';
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash).then(result => {
  console.log('Password match result:', result);
  if (result) {
    console.log('✓ Password is CORRECT');
  } else {
    console.log('✗ Password is INCORRECT');
    console.log('\nGenerating new hash for the password...');
    bcrypt.hash(password, 10).then(newHash => {
      console.log('New hash:', newHash);
    });
  }
}).catch(error => {
  console.error('Error:', error);
});
