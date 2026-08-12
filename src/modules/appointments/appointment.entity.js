const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const AppointmentType = require("../../common/enums/appointment-type.enum");

module.exports = new EntitySchema({
  name: "Appointment",

  tableName: "appointments",

  columns: {
    ...BaseEntity,

    appointmentDateTime: {
      name: "appointment_date_time",
      type: "timestamp",
      nullable: false,
    },

    appointmentType: {
      name: "appointment_type",
      type: "enum",
      enum: Object.values(AppointmentType),
      nullable: false,
    },

    status: {
      type: "enum",
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },

  /*  TODO: Enable when online consultation is supported.
    appointmentMode: {
     name: "appointment_mode",
     type: "enum",
     enum: ["OFFLINE", "ONLINE"],
     default: "OFFLINE",
}*/

    reason: {
      type: "text",
      nullable: false,
    },

    consultationNotes: {
      name: "consultation_notes",
      type: "text",
      nullable: true,
    },

    cancellationReason: {
      name: "cancellation_reason",
      type: "text",
      nullable: true,
    },
  },

  relations: {
    patient: {
      type: "many-to-one",
      target: "Patient",
      joinColumn: {
        name: "patient_id",
      },
      nullable: false,
      inverseSide: "appointments",
      onDelete: "RESTRICT",
    },

    doctor: {
      type: "many-to-one",
      target: "Doctor",
      joinColumn: {
        name: "doctor_id",
      },
      nullable: false,
      inverseSide: "appointments",
      onDelete: "RESTRICT",
    },

    receptionist: {
      type: "many-to-one",
      target: "Receptionist",
      joinColumn: {
        name: "receptionist_id",
      },
      nullable: true,
      inverseSide: "appointments",
      onDelete: "SET NULL",
    },
    prescription: {
      type: "one-to-one",
      target: "Prescription",
      inverseSide: "appointment",
    },
    billing: {
      type: "one-to-one",
      target: "Billing",
      inverseSide: "appointment",
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
  },
});