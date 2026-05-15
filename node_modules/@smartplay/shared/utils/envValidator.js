const REQUIRED_VARS = ['MONGODB_URI', 'MONGODB_DB', 'JWT_SECRET'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('\n========================================');
    console.error('  MISSING REQUIRED ENVIRONMENT VARIABLES');
    console.error('========================================');
    missing.forEach(v => console.error(`  X ${v}`));
    console.error('\n  Check your .env file.');
    console.error('========================================\n');
    process.exit(1);
  }
  console.log('Environment validation passed\n');
}

module.exports = { validateEnv };