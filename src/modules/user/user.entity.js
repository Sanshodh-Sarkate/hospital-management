const { EntitySchema } = require("typeorm");
const BaseEntity = require('../../common/database/baseEntity')
const Roles = require('../../common/enums/role.enum')
const DB = require('../../common/constants/database.constants');
const { type } = require("node:os");



const UserEntity = new EntitySchema({

name: "User",
tableName: "users",

columns: {
  ...BaseEntity,
  
    firstName: {
      name: "first_name",
      type: "varchar",
      length: DB.NAME_MAX_LENGTH,
    },

    lastName: {
      name: "last_name",
      type: "varchar",
      length: DB.NAME_MAX_LENGTH,
    },

    email: {
      type: "varchar",
      length: DB.EMAIL_MAX_LENGTH,
      unique: true,
    },

    password: {
      type: "varchar",
      length: DB.PASSWORD_MAX_LENGTH,
      select: false,
    },

    phoneNumber: {
      type: "varchar",
      length: DB.PHONE_MAX_LENGTH,
      unique: true,
    },

    role: {
      type: "enum",
      enum: Object.values(Roles),
      default: Roles.PATIENT,
    },

    isActive: {
      name: "is_active",
      type: "boolean",
      default: true,
    },

    lastLogin: {
      name: "last_login",
      type: "timestamp",
      nullable: true,
    },
    passwordResetToken: {
      name: "password_reset_token",
      type: "varchar",
      length: 255,
      nullable: true

    },

    passwordResetExpires: {
      name: "password_reset_expires",
      type: "timestamp",
      nullable: true,
    },
    passwordChangedAt: {
    name: "password_changed_at",
    type: "timestamp",
    nullable: true,
},
  },

  relations: {
    doctor: {
      type: "one-to-one",
      target: "Doctor",
      inverseSide: "user",
    },

    patient: {
      type: "one-to-one",
      target: "Patient",
      inverseSide: "user",
    },

    receptionist: {
      type: "one-to-one",
      target: "Receptionist",
      inverseSide: "user"
    },
    notifications: {
      type: "one-to-many",
      target: "Notification",
      inverseSide: "user",
    },

  },
});

module.exports = UserEntity;