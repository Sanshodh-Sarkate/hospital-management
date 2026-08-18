const {EntitySchema} = require("typeorm");
const  baseEntity  = require("../../common/database/baseEntity");
const  DB =  require("../../common/constants/database.constants")

const  departmentEntity  =  new EntitySchema ({
    name: "Department",
    tableName: "department",

    columns: {
    ...baseEntity,

    departmentName: {
      type: "varchar",
      length: DB.DEPARTMENT_NAME_MAX_LENGTH,
      unique: true,
      nullable: false,
    },

    description: {
      type: "text",
      nullable: true,
    },

    floor: {
      type: "int",
      nullable: false,
    },

    defaultConsultationFee: {
      name: "default_consultation_fee",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0.0,
    },

    isActive: {
      name: "is_active",
      type: "boolean",
      default: true,
    },
  },

  relations: {
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "created_by",
      },
      nullable: false,
      onDelete: "RESTRICT",
    },

    updatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "updated_by",
      },
      nullable: true,
      onDelete: "SET NULL",
    },

    doctors: {
      type: "one-to-many",
      target: "Doctor",
      inverseSide: "department",
    },

    appointments: {
      type: "one-to-many",
      target: "Appointment",
      inverseSide: "department",
    },
  },
})


module.exports =  departmentEntity