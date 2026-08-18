const bcrypt = require('bcrypt');
const crypto = require('crypto');


const createPasswordResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');  // create the  random string token 

    // hash the resetToken 
    const hashedResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    // Token expires after 10 minutes
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    return {
        resetToken,
        hashedResetToken,
        resetTokenExpires,
    };
};

module.exports =  {createPasswordResetToken }