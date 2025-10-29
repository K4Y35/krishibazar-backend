// Quick test to check database connection and table
const db = require('./db.js');

console.log("Testing database connection...");

// Test 1: Check if connection works
db.query("SELECT 1 as test", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Database connection OK");
  
  // Test 2: Check if table exists
  db.query("SHOW TABLES LIKE 'chat_messages'", (err, result) => {
    if (err) {
      console.error("Error checking table:", err);
      process.exit(1);
    }
    
    if (result.length === 0) {
      console.error("❌ chat_messages table does NOT exist!");
      console.log("Run: mysql -u username -p database < create_chat_table.sql");
      process.exit(1);
    }
    console.log("✅ chat_messages table exists");
    
    // Test 3: Try to insert a test message
    db.query(
      "INSERT INTO chat_messages (sender_id, sender_type, receiver_id, message) VALUES (?, ?, ?, ?)",
      [999, 'user', NULL, 'Test message'],
      (err, result) => {
        if (err) {
          console.error("❌ Cannot insert into chat_messages:", err.message);
          console.error("SQL Error:", err.code);
          process.exit(1);
        }
        console.log("✅ Can insert into chat_messages. Insert ID:", result.insertId);
        
        // Delete test message
        db.query("DELETE FROM chat_messages WHERE id = ?", [result.insertId], () => {
          console.log("✅ Cleanup complete - test message deleted");
          console.log("\n🎉 Database is ready for chat!");
          process.exit(0);
        });
      }
    );
  });
});

