export const generateOtp = async () => {
  // generate unique 4 char otp numeric
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

export const isTestCode = async (code) => {
    return code == '234234';
}