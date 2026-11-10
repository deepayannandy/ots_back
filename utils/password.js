const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%*";

// Cryptographically random password (no ambiguous chars like 0/O, 1/l/I).
function generatePassword(length = 12) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

// New accounts store bcrypt hashes; legacy accounts still hold plaintext,
// so fall back to a direct comparison for those.
async function verifyPassword(plain, stored) {
  if (typeof plain !== "string" || typeof stored !== "string") return false;
  if (/^\$2[aby]\$/.test(stored)) return bcrypt.compare(plain, stored);
  return plain === stored;
}

module.exports = { generatePassword, hashPassword, verifyPassword };
