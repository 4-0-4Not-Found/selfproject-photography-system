const { Booking, Order } = require('./Models');

async function checkMigration() {
  try {
    console.log('🔍 Checking if soft delete migration was applied...');
    
    // Check Booking model
    const bookingInstance = await Booking.findOne();
    if (bookingInstance) {
      console.log('✅ Booking model has soft delete fields:', {
        deletedByUser: bookingInstance.deletedByUser,
        userDeletedAt: bookingInstance.userDeletedAt
      });
    } else {
      console.log('ℹ️ No bookings found to check');
    }
    
    // Check Order model  
    const orderInstance = await Order.findOne();
    if (orderInstance) {
      console.log('✅ Order model has soft delete fields:', {
        deletedByUser: orderInstance.deletedByUser,
        userDeletedAt: orderInstance.userDeletedAt
      });
    } else {
      console.log('ℹ️ No orders found to check');
    }
    
    console.log('\n📊 If you see "undefined" for the fields, the migration did not run properly.');
    console.log('📊 If you see "false" and "null", the migration was successful!');
    
  } catch (error) {
    console.error('❌ Error checking migration:', error);
  }
}

checkMigration();