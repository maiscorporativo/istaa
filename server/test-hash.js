const bcrypt = require('bcrypt');

async function test() {
  const hash = '$2b$10$wN9P358J.9Q/2x4Q/rU8uuzrV5QhXlZ.k9xR.tQ4H1yE8T8b/gR3G';
  const password = 'Admin@123';
  const result = await bcrypt.compare(password, hash);
  console.log("Password matches hash?", result);
  process.exit();
}
test();
