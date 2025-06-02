// models/user.model.js - Updated to match new database schema
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    fullName: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    userType: {
      type: Sequelize.ENUM('founder', 'investor', 'admin'),
      allowNull: false
    },
    companyName: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    phoneNumber: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    bvn: {
      type: Sequelize.STRING(11),
      allowNull: true
    },
    cacNumber: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    accountNumber: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    bankName: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    profileImageUrl: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    emailVerifiedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    lastLoginAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      field: 'createdAt'
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      field: 'updatedAt'
    }
  }, {
    // Table options
    tableName: 'users',
    timestamps: true,
    underscored: false, // Use camelCase
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['userType']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return User;
};