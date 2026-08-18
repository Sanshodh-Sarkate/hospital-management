const bcrypt  =  require("bcrypt")

const saltRounds =  Number(process.env.SALT_ROUNDS) || 10 ;

module.exports.hashPassword = async(password) =>{
    return  bcrypt.hash(password ,  saltRounds);
}

module.exports.compareHashedPassword =   async(plainPassword ,  hashPassword) => {
    return bcrypt.compare(plainPassword ,  hashPassword)
}