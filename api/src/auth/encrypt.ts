import * as bcrypt from 'bcrypt';

// Hashes the given password and returns the resulting hash
export async function hashPassword(password) {
  const saltRounds = 10;

  // Generate a random salt with 10 rounds of hashing
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash the password using the salt
  const hash = await bcrypt.hash(password, salt);

  // Return the resulting hash
  return hash;
}

// Compares the given password to the given hash and returns a boolean value
export async function comparePassword(password, hash) {
  // Use bcrypt.compare() to compare the password to the hash
  const isMatch = await bcrypt.compare(password, hash);

  // Return the result of the comparison as a boolean value
  return isMatch;
}
