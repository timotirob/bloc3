import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define("User", {
    identifiant: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

export default User;