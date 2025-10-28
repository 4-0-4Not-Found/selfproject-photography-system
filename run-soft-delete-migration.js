const migration = require('./migrations/add-soft-delete-fields');

async function runMigration() {
  try {
    console.log('🎯 Starting professional soft delete implementation...');
    console.log('This will add proper soft delete fields to your database.');
    console.log('This is a safe operation that will not affect existing data.');
    
    await migration.up();
    
    console.log('🎉 Migration completed successfully!');
    console.log('✅ Your database now has professional soft delete capabilities');
    console.log('✅ Customers can "delete" records without affecting admin view');
    console.log('✅ All existing data is preserved');
    console.log('🔧 Next: Update your controllers and restart the server');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();