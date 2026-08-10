const AppDataSource = require("../../config/db");
const Receptionist = require("./receptionist.entity");
const receptionistRepository = AppDataSource.getRepository(Receptionist);

const registerReceptionist = async (manager, receptionistData) => {
  const repository = manager.getRepository(Receptionist);
  const newReceptionist = repository.create(receptionistData);
  return await repository.save(newReceptionist);
};


const getAllReceptionist = async () => {
  return await receptionistRepository.find({
        where: {
            isActive: true
        },
        relations: {
            user : true
        },
        order: {
            createdAt: "DESC"
        }

    })
}



//  * Get Receptionist By Id
const findReceptionistById = async (
  receptionistId
) => {
  return await receptionistRepository.findOne({
    where: {
      id: receptionistId,
      isActive: true,
    },
    relations: {
      user: true,
      createdBy: true,
      updatedBy: true,
    },
  });
};

//  * Get Receptionist By Employee Id
const findReceptionistByEmployeeId = async (
  employeeId
) => {
  return await receptionistRepository.findOne({
    where: {
      employeeId,
      isActive: true,
    }
    // relations: {
    //   user : true  
    // }
  });
};


//  * Get Last Employee Id
const findLastEmployeeId = async () => {
  const [lastReceptionist] = await receptionistRepository.find({
    select: {
      employeeId: true,
    },
    order: {
      employeeId: "DESC",
    },
    take: 1,
  });
  return lastReceptionist || null;
};

const updateReceptionistWithTransaction = async (manager, receptionistId, updatedData) => {
  const repository = manager.getRepository(Receptionist);
  const updateReceptionist = repository.update(receptionistId, updatedData);
  return await repository.findOne({
    where: {
      id: receptionistId
    },
    relations: {
      user: true
    }

  })

}


module.exports = {
  registerReceptionist,
  getAllReceptionist,
  findReceptionistById,
  findReceptionistByEmployeeId,
  findLastEmployeeId,
  updateReceptionistWithTransaction
}