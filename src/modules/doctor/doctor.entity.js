const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");
const DB = require("../../common/constants/database.constants");

const Gender = require("../../common/enums/gender.enum");
const DoctorAvailability = require("../../common/enums/doctor-availability.enum");

module.exports = new EntitySchema({
  name: "Doctor",

  tableName: "doctors",

  columns: {
    ...BaseEntity,

    userId: {
      name: "user_id",
      type: "uuid",
      unique: true,
      nullable: false,
    },

    departmentId: {
      name: "department_id",
      type: "uuid",
      nullable: false,
    },

    specialization: {
      type: "varchar",
      length: DB.SPECIALIZATION_MAX_LENGTH,
      nullable: false,
    },

    qualification: {
      type: "varchar",
      length: DB.QUALIFICATION_MAX_LENGTH,
      nullable: false,
    },

    experienceYears: {
      name: "experience_years",
      type: "int",
      default: 0,
    },

    licenseNumber: {
      name: "license_number",
      type: "varchar",
      length: DB.LICENSE_NUMBER_MAX_LENGTH,
      unique: true,
      nullable: false,
    },

    consultationFee: {
      name: "consultation_fee",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },

    gender: {
      type: "enum",
      enum: Object.values(Gender),
      nullable: false,
    },

    dateOfBirth: {
      name: "date_of_birth",
      type: "date",
      nullable: false,
    },

    address: {
      type: "text",
      nullable: false,
    },

    emergencyContact: {
      name: "emergency_contact",
      type: "varchar",
      length: DB.PHONE_MAX_LENGTH,
      nullable: false,
    },

    profileImage: {
      name: "profile_image",
      type: "varchar",
      length: DB.PROFILE_IMAGE_MAX_LENGTH,
      nullable: true,
    },

    bio: {
      type: "text",
      nullable: true,
    },

    availabilityStatus: {
      name: "availability_status",
      type: "enum",
      enum: Object.values(DoctorAvailability),
      default: DoctorAvailability.AVAILABLE,
    },

    isActive: {
      name: "is_active",
      type: "boolean",
      default: true,
    },

    createdBy: {
      name: "created_by",
      type: "uuid",
      nullable: false,
    },

    updatedBy: {
      name: "updated_by",
      type: "uuid",
      nullable: true,
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
      inverseSide: "doctor",
    },

    department: {
      type: "many-to-one",
      target: "Department",
      joinColumn: {
        name: "department_id",
      },
      nullable: false,
      onDelete: "RESTRICT",
      inverseSide: "doctors",
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
      onDelete: "SET NULL"
    },
    appointments: {
    type: "one-to-many",
    target: "Appointment",
    inverseSide: "doctor",
},
    prescriptions: {
      type: "one-to-many",
      target: "Prescription",
      inverseSide: "doctor",
    },
  }
});