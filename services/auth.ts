const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_OF_DEVELOPER,
    pass: "ieprbpgvmzraefqd",
  },
});

export const sendOtpViaEmail = async (email:string,otp:string)=>{
  try{

     await transporter.sendMail({
      from: process.env.EMAIL_OF_DEVELOPER, // sender address
      to: email, // list of receivers
      subject: `Service-Req`, // Subject line
      text: `Your OTP is ${otp}`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });
    return true; 
  }catch(e){
    console.log(e);
    return false;
  }
}

