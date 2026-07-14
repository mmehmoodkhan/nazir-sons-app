export const sendSmsOtp = async (phone, otp) => {

  console.log(
    `OTP ${otp} sent to ${phone}`
  );

  return true;
};