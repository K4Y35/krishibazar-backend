CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  usertype TINYINT UNSIGNED NOT NULL, -- 1=farmer 2 = investors
  nid_front VARCHAR(255),
  nid_back VARCHAR(255),
  password_hash VARCHAR(255),
  otp_code VARCHAR(10),
  otp_expires_at DATETIME,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved INT(11) DEFAULT 0, -- 0 = pending, 1 = approved, 2 = rejected
  approved_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
