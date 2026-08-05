const {EntitySchema} = require("typeorm");
const  baseEntity  = require("../../common/database/baseEntity");
const  DB =  require("../../common/constants/database.constants")

const gender  =  require("../../common/enums/gender.enum")
const BloodGroup = require("../../common/enums/bloodGrp.entity")

module.exports = new EntitySchema({
  name: "Patient",

  tableName: "patients",

  columns: {
    ...baseEntity,

    dateOfBirth: {
      name: "date_of_birth",
      type: "date",
      nullable: false,
    },

    gender: {
      type: "enum",
      enum: Object.values(gender),
      nullable: false,
    },

    bloodGroup: {
      name: "blood_group",
      type: "enum",
      enum: Object.values(BloodGroup),
      nullable: false,
    },

    address: {
      name: "address_line_1",
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

    emergencyContactName: {
      name: "emergency_contact_name",
      type: "varchar",
      length: 100,
      nullable: false,
    },

    emergencyContactNumber: {
      name: "emergency_contact_number",
      type: "varchar",
      length: DB.PHONE_MAX_LENGTH,
      nullable: false,
    },

    emergencyContactRelation: {
      name: "emergency_contact_relation",
      type: "varchar",
      length: 50,
      nullable: false,
    },

    insuranceProvider: {
      name: "insurance_provider",
      type: "varchar",
      length: 150,
      nullable: true,
    },

    insurancePolicyNumber: {
      name: "insurance_policy_number",
      type: "varchar",
      length: 100,
      nullable: true,
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
      inverseSide: "patient",
    },
    appointments: {
    type: "one-to-many",
    target: "Appointment",
    inverseSide: "patient",
},
    prescriptions: {
      type: "one-to-many",
      target: "Prescription",
      inverseSide: "patient",
    },
    billings: {
      type: "one-to-many",
      target: "Billing",
      inverseSide: "patient",
    },
  },
});

