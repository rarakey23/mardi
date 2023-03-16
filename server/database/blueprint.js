import { DataTypes } from "sequelize";

export default {
    Session() {
        return [
            "devices",
            {
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                session_name: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false,
                    validate: {
                        isLowercase: true,
                    }
                },
                session_number: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.STRING,
                    allowNull: false,
                }
            },
            { tableName: "devices", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
        ];
    },
    Users() {
        return [
            "users",
            {
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                username: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                role: {
                    type: DataTypes.ENUM("admin", "user"),
                    allowNull: false,
                    defaultValue: "user",
                },
                remember_token: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            { tableName: "users", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    },
    MessageTemplate() {
        return [
            "message_template",
            {
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                media: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                footer: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                button: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                user_id: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                product_title: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                currency: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                price: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                after_discount: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                url: {
                    type: DataTypes.STRING,
                    allowNull: true
                }
            },
            { tableName: "message_template", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    },
    Contacts() {
        return [
            "contacts",
            {
                user_id: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                device_id: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                number: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.ENUM("personal", "group"),
                    allowNull: false,
                    defaultValue: "personal",
                },
                label: {
                    type: DataTypes.STRING,
                    allowNull: true,
                }
            },
            { tableName: "contacts", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    },
    ButtonTemplate() {
        return [
            "button_template",
            {
                id_message_template: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                index_id: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                display_text: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                action: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.ENUM("listButton", "urlButton", "callButton", "quickReplyButton"),
                    allowNull: false,
                    defaultValue: "urlButton",
                }
            },
            { tableName: "button_template", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    },
    Blast() {
        return [
            "blast",
            {
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                id_message_template: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                id_device: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                receiver: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                user_id: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM("pending", "sent", "failed"),
                    allowNull: false,
                },
                is_save: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                }
            },
            { tableName: "blast", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    },
    AutoReply() {
        return [
            "autoreply",
            {
                keyword: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                id_message_template: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                id_device: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
                user_id: {
                    type: DataTypes.BIGINT(200),
                    allowNull: false,
                },
            },
            { tableName: "autoreply", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
        ]
    }

}