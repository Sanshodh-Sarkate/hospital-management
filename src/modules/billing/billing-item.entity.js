const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity")

module.exports = new EntitySchema({
  name: "BillingItem",

  tableName: "billing_items",

  columns: {
    ...BaseEntity,

    itemName: {
      name: "item_name",
      type: "varchar",
      length: 255,
      nullable: false,
    },

    description: {
      type: "text",
      nullable: true,
    },

    quantity: {
      type: "int",
      nullable: false,
      default: 1,
    },

    unitPrice: {
      name: "unit_price",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },

    totalPrice: {
      name: "total_price",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
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
      inverseSide: "billingItems",
      onDelete: "CASCADE",
    },
  },
});