const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");

module.exports = new EntitySchema({
  name: "Notification",

  tableName: "notifications",

  columns: {
    ...BaseEntity,

    title: {
      type: "varchar",
      length: 255,
      nullable: false,
    },

    message: {
      type: "text",
      nullable: false,
    },

    type: {
      type: "enum",
      enum: [
        "APPOINTMENT",
        "PRESCRIPTION",
        "BILLING",
        "PAYMENT",
        "SYSTEM",
      ],
      nullable: false,
    },

    readAt: {
      name: "read_at",
      type: "timestamp",
      nullable: true,
    },
  },

  relations: {
    user: {
      type: "many-to-one",

      target: "User",

      joinColumn: {
        name: "user_id",
      },

      nullable: false,

      inverseSide: "notifications",

      onDelete: "CASCADE",
    },
  },
});