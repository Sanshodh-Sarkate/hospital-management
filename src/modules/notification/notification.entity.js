const { EntitySchema } = require("typeorm");
const BaseEntity = require("../../common/database/baseEntity");
const NotificationType = require("../../common/enums/notification-type.enum");

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
      enum: Object.values(NotificationType),
      nullable: false,
    },

    metadata: {
      type: "jsonb",
      nullable: true,
    },

    isRead: {
      name: "is_read",
      type: "boolean",
      default: false,
      nullable: false,
    },
  },

  relations: {
    recipient: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "recipient_id",
      },
      nullable: false,
      inverseSide: "notifications",
      onDelete: "CASCADE",
    },
  },
});
