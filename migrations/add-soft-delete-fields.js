const { QueryTypes } = require('sequelize');
const sequelize = require('../Config/database');

module.exports = {
  up: async () => {
    try {
      console.log('🚀 Starting professional soft delete migration...');
      
      // Add fields to Bookings table
      await sequelize.query(`
        ALTER TABLE "Bookings" 
        ADD COLUMN IF NOT EXISTS "deletedByUser" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "userDeletedAt" TIMESTAMP WITH TIME ZONE;
      `, { type: QueryTypes.RAW });

      // Add fields to Orders table  
      await sequelize.query(`
        ALTER TABLE "Orders" 
        ADD COLUMN IF NOT EXISTS "deletedByUser" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "userDeletedAt" TIMESTAMP WITH TIME ZONE;
      `, { type: QueryTypes.RAW });

      console.log('✅ Migration completed: Professional soft delete fields added');
      console.log('📊 Fields added: deletedByUser (boolean), userDeletedAt (timestamp)');
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  down: async () => {
    try {
      console.log('Rolling back soft delete fields...');
      
      await sequelize.query(`
        ALTER TABLE "Bookings" 
        DROP COLUMN IF EXISTS "deletedByUser",
        DROP COLUMN IF EXISTS "userDeletedAt";
      `, { type: QueryTypes.RAW });

      await sequelize.query(`
        ALTER TABLE "Orders" 
        DROP COLUMN IF EXISTS "deletedByUser",
        DROP COLUMN IF EXISTS "userDeletedAt";
      `, { type: QueryTypes.RAW });

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback error:', error);
      throw error;
    }
  }
};