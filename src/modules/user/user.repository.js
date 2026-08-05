const AppDataSource = require("../../config/db");
const User = require("./user.entity");
const {MoreThan} =  require('typeorm')

const userRepository = AppDataSource.getRepository(User);

const findUserByEmail = async (email) => {
  return await userRepository.findOne({
    where: { email },
  });
};

const findUserById = async (id) => {
  return await userRepository.findOne({
    where: { id },
  });
};

const createNewUser = async (userData) => {
  const newUser = userRepository.create(userData);

  return await userRepository.save(newUser);
};

const updateUser = async (id, updateData) => {
  await userRepository.update(id, updateData);

  return await findUserById(id);
};

const deleteUser = async (id) => {
  return await userRepository.delete(id);
};

const findAllUsers = async () => {
  return await userRepository.find();
};
const findUserByEmailWithPassword = async (email) => {
  return await userRepository.findOne({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      role: true,
      phoneNumber: true,
      isActive: true,
    },
  });
};

const findUserByResetToken =  async(hashToken) => {
    return  await userRepository.findOne({
        where : {
            passwordResetToken:  hashToken ,
            passwordResetExpires: MoreThan(new Date())
        },  select: { 
      id: true,
      password: true,
      passwordResetToken: true,
      passwordResetExpires: true,
      passwordChangedAt: true,
     },
    });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createNewUser,
  updateUser,
  deleteUser,
  findAllUsers,
  findUserByEmailWithPassword,
  findUserByResetToken
};