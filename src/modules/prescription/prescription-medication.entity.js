const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

module.exports = new EntitySchema({
  name: "PrescriptionMedication",

  tableName: "prescription_medications",

  columns: {
    ...BaseEntity,

    medicineName: {
      name: "medicine_name",
      type: "varchar",
      length: 255,
      nullable: false,
    },

    dosage: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    frequency: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    duration: {
      type: "varchar",
      length: 100,
      nullable: false,
    },

    quantity: {
      type: "varchar",
      length: 50,
      nullable: false,
    },

    specialInstructions: {
      name: "special_instructions",
      type: "text",
      nullable: true,
    },
  },

  relations: {
    prescription: {
      type: "many-to-one",
      target: "Prescription",
      joinColumn: {
        name: "prescription_id",
      },
      nullable: false,
      inverseSide: "prescriptionMedications",
      onDelete: "CASCADE",
    },
  },
});