const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

module.exports = new EntitySchema({
  name: "Prescription",

  tableName: "prescriptions",

  columns: {
    ...BaseEntity,

    diagnosis: {
      type: "text",
      nullable: false,
    },

    symptoms: {
      type: "text",
      nullable: true,
    },

    advice: {
      type: "text",
      nullable: true,
    },

    followUpDate: {
      name: "follow_up_date",
      type: "date",
      nullable: true,
    },
  },

  relations: {
    //one appoinment has only one presescription
    appointment: {
      type: "one-to-one",
      target: "Appointment",
      joinColumn: {
        name: "appointment_id",
      },
      nullable: false,
      unique: true,
      inverseSide: "prescription",
      onDelete: "RESTRICT",
    },


    //many prescription belong to the one doctor 
    doctor: {
      type: "many-to-one",
      target: "Doctor",
      joinColumn: {
        name: "doctor_id",
      },
      nullable: false,
      inverseSide: "prescriptions",
      onDelete: "RESTRICT",
    },

    //one patient has the many prescriptions 
    patient: {
      type: "many-to-one",
      target: "Patient",
      joinColumn: {
        name: "patient_id",
      },
      nullable: false,
      inverseSide: "prescriptions",
      onDelete: "RESTRICT",
    },
 prescriptionMedications: {
  type: "one-to-many",
  target: "PrescriptionMedication",
  inverseSide: "prescription",
},
  }
});