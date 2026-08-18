const { EntitySchema } = require("typeorm");

const BaseEntity = {
    id: {
        type: "uuid",
        primary: true,
        generated: "uuid"
    },

    createdAt: {
        name: "created_at",
        type: "timestamp",
        createDate: true
    },

    updatedAt: {
        name: "updated_at",
        type: "timestamp",
        updateDate: true
    },
}

module.exports = BaseEntity;  