/**
 * Script to display demo credentials for the Clinic CRM
 * Run with: npx tsx scripts/show-demo-credentials.ts
 */

import { DEMO_CREDENTIALS } from '../src/lib/data/users';

console.log('\n=== CLINIC CRM - DEMO CREDENTIALS ===\n');

console.log('🔑 Admin:');
console.log(`   Email:    ${DEMO_CREDENTIALS.admin.email}`);
console.log(`   Password: ${DEMO_CREDENTIALS.admin.password}`);
console.log('');

console.log('👨‍⚕️ Doctor:');
console.log(`   Email:    ${DEMO_CREDENTIALS.doctor.email}`);
console.log(`   Password: ${DEMO_CREDENTIALS.doctor.password}`);
console.log('');

console.log('👩‍⚕️ Nurse:');
console.log(`   Email:    ${DEMO_CREDENTIALS.nurse.email}`);
console.log(`   Password: ${DEMO_CREDENTIALS.nurse.password}`);
console.log('');

console.log('📋 Receptionist:');
console.log(`   Email:    ${DEMO_CREDENTIALS.receptionist.email}`);
console.log(`   Password: ${DEMO_CREDENTIALS.receptionist.password}`);
console.log('');

console.log('💊 Pharmacist:');
console.log(`   Email:    ${DEMO_CREDENTIALS.pharmacist.email}`);
console.log(`   Password: ${DEMO_CREDENTIALS.pharmacist.password}`);
console.log('');

console.log('=====================================\n');
