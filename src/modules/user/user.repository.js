const AppDataSource = require("../../config/db");
const User = require("./user.entity");
const { MoreThan } = require('typeorm')

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

const findUserByPhoneNumber = async (phoneNumber) => {
  return await userRepository.findOne({
    where: {
      phoneNumber,
    },
  });
};

// module.exports.findUserByPhoneNumber = async (phoneNumber) => {
//   const userRepository = getRepository(User);
//   return await userRepository.findOne({
//     where: { phoneNumber },
//   });
// };


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

const findUserByResetToken = async (hashToken) => {
  return await userRepository.findOne({
    where: {
      passwordResetToken: hashToken,
      passwordResetExpires: MoreThan(new Date())
    }, select: {
      id: true,
      password: true,
      passwordResetToken: true,
      passwordResetExpires: true,
      passwordChangedAt: true,
    },
  });
}


// TODO:
const createNewUserWithTransaction = async (manager, userData) => {
  const repository = manager.getRepository(User);
  const user = repository.create(userData);
  return await repository.save(user);

}

const updateUserWithTransaction = async (manager, userId, updateData) => {
  const repository = manager.getRepository(User);
  const user = repository.update(userId, updateData);
  return await repository.findOne({
    where: {
      id: userId
    }
  })
}



const findUsersByRole = async (role) => {
  return await userRepository.find({
    where: { role },
  });
};


//
const findUserByIdWithRefreshToken = async (id) => {
  return await userRepository.findOne({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      refreshTokenHash: true,
      passwordChangedAt: true,
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createNewUser,
  updateUser,
  deleteUser,
  findAllUsers,
  findUserByEmailWithPassword,
  findUserByResetToken,
  findUserByPhoneNumber,
  createNewUserWithTransaction,
  updateUserWithTransaction,
  findUsersByRole,
  //
  findUserByIdWithRefreshToken,
};

