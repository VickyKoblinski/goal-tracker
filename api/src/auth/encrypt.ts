import * as bcrypt from 'bcrypt';

// Hashes the given password and returns the resulting hash
export function hashPassword(password) {
  const saltRounds = 10;

  // Generate a random salt with 10 rounds of hashing
  const salt = bcrypt.genSaltSync(saltRounds);

  // Hash the password using the salt
  const hash = bcrypt.hashSync(password, salt);

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

// Generate a unique token
export async function generateVerificationToken(): Promise<string> {
  const token = await bcrypt.hash(Date.now().toString(), 10);
  return token;
}
