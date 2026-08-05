const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

module.exports = new EntitySchema({
  name: "Billing",

  tableName: "billings",

  columns: {
    ...BaseEntity,

    billNumber: {
      name: "bill_number",
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },

    totalAmount: {
      name: "total_amount",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },

    discountAmount: {
      name: "discount_amount",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
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

    insuranceCoverageAmount: {
      name: "insurance_coverage_amount",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },

    finalAmount: {
      name: "final_amount",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },

    billingDate: {
      name: "billing_date",
      type: "date",
      nullable: false,
    },

    notes: {
      type: "text",
      nullable: true,
    },
  },

  relations: {
    appointment: {
      type: "one-to-one",
      target: "Appointment",

      joinColumn: {
        name: "appointment_id",
      },

      nullable: false,

      unique: true,

      inverseSide: "billing",

      onDelete: "RESTRICT",
    },

    patient: {
      type: "many-to-one",
      target: "Patient",
      joinColumn: {
        name: "patient_id",
      },
      nullable: false,
      inverseSide: "billings",
      onDelete: "RESTRICT",
    },
    billingItems: {
      type: "one-to-many",
      target: "BillingItem",
      inverseSide: "billing",
    },

    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "billing",
    },
  },
});