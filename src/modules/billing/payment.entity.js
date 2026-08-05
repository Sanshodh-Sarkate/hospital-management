const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

const PaymentMethod = require("../../common/enums/payment-method.enum");

module.exports = new EntitySchema({
  name: "Payment",

  tableName: "payments",

  columns: {
    ...BaseEntity,

    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },

    paymentMethod: {
      name: "payment_method",
      type: "enum",
      enum: Object.values(PaymentMethod),
      nullable: false,
    },

    paymentDate: {
      name: "payment_date",
      type: "timestamp",
      nullable: false,
    },

    transactionId: {
      name: "transaction_id",
      type: "varchar",
      length: 255,
      nullable: true,
    },

    notes: {
      type: "text",
      nullable: true,
    },
  },

  relations: {
    billing: {
      type: "many-to-one",
      target: "Billing",
      joinColumn: {
        name: "billing_id",
      },
      nullable: false,
      inverseSide: "payments",
      onDelete: "CASCADE",
    },
  },
});