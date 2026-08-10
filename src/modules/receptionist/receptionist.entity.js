const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");
const DB = require("../../common/constants/database.constants");

const Gender = require("../../common/enums/gender.enum");
const Shift = require("../../common/enums/shift.enum");

module.exports = new EntitySchema({
  name: "Receptionist",

  tableName: "receptionists",

  columns: {
    ...BaseEntity,

     employeeId: {
      name: "employee_id",
      type: "varchar",
      length: 20,
      unique: true,
      nullable: false,
    },

    dateOfBirth: {
      name: "date_of_birth",
      type: "date",
      nullable: false,
    },

    gender: {
      type: "enum",
      enum: Object.values(Gender),
      nullable: false,
    },

    address: {
      name: "address",
      type: "varchar",
      length: 255,
      nullable: false,
    },

    city: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    state: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    country: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    postalCode: {
      name: "postal_code",
      type: "varchar",
      length: 20,
      nullable: false,
    },

    joiningDate: {
      name: "joining_date",
      type: "date",
      nullable: false,
    },

    shift: {
      type: "enum",
      enum: Object.values(Shift),
      nullable: false,
    },

    profileImage: {
      name: "profile_image",
      type: "varchar",
      length: DB.PROFILE_IMAGE_MAX_LENGTH,
      nullable: true,
    },

    isActive: {
      name: "is_active",
      type: "boolean",
      default: true,
    },
  },

  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
      },
      nullable: false,
      onDelete: "CASCADE",
      inverseSide: "receptionist",
    },

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
    appointments: {
      type: "one-to-many",
      target: "Appointment",
      inverseSide: "receptionist",
    },
  },
});