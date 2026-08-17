const { EntitySchema } = require("typeorm");
const baseEntity = require("../../common/database/baseEntity");

module.exports = new EntitySchema({
  name: "Hospital",
  tableName: "hospital",

  columns: {
    ...baseEntity,

    name: {
      type: "varchar",
      length: 150,
      nullable: false,
    },

    code: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },

    tagline: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    description: {
      type: "text",
      nullable: true,
    },

    email: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    phone: {
      type: "varchar",
      length: 20,
      nullable: false,
    },

    emergencyPhone: {
      name: "emergency_phone",
      type: "varchar",
      length: 20,
      nullable: true,
    },

    address: {
      type: "text",
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
      default: "India",
    },

    postalCode: {
      name: "postal_code",
      type: "varchar",
      length: 20,
      nullable: false,
    },

    website: {
      type: "varchar",
      length: 150,
      nullable: true,
    },

    establishedYear: {
      name: "established_year",
      type: "int",
      nullable: true,
    },

    totalBeds: {
      name: "total_beds",
      type: "int",
      nullable: true,
      default: 250,
    },

    operatingHours: {
      name: "operating_hours",
      type: "varchar",
      length: 100,
      nullable: true,
      default: "24/7 Emergency & OPD Services",
    },

    logoUrl: {
      name: "logo_url",
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
});
