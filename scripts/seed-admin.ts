import admin from 'firebase-admin';
import { config } from '../src/shared/config/env.config.js';
import { FirestoreAdapter } from '../src/shared/database/adapters/firestore/FirestoreAdapter.js';
import { UserRepository } from '../src/domain/repositories/UserRepository.js';
import { UserRole } from '../src/domain/models/User.js';

const ADMIN_EMAIL = 'moty.moshin@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_DISPLAY_NAME = 'Admin User';

async function seedAdminUser() {
  console.log('Starting admin user seed...');

  const firestoreAdapter = new FirestoreAdapter();
  await firestoreAdapter.connect();
  
  const userRepository = new UserRepository(firestoreAdapter);
  const organizationId = config.defaultOrganizationId;

  try {
    // Check if user already exists in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`✓ Firebase Auth user already exists: ${ADMIN_EMAIL}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        firebaseUser = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_DISPLAY_NAME,
        });
        console.log(`✓ Created Firebase Auth user: ${ADMIN_EMAIL}`);
      } else {
        throw error;
      }
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(firebaseUser.uid, {
      role: UserRole.ADMIN,
      organizationId,
    });
    console.log(`✓ Set custom claims: role=${UserRole.ADMIN}, organizationId=${organizationId}`);

    // Check if Firestore user document exists
    const existingUser = await userRepository.findById(firebaseUser.uid);
    
    if (existingUser) {
      console.log(`✓ Firestore user document already exists`);
    } else {
      // Create Firestore user document
      await userRepository.create({
        id: firebaseUser.uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_DISPLAY_NAME,
        role: UserRole.ADMIN,
        organizationId,
      });
      console.log(`✓ Created Firestore user document`);
    }

    console.log('\n✅ Admin user seed completed successfully!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ${UserRole.ADMIN}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await firestoreAdapter.disconnect();
  }
}

// Run the seed script
seedAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
