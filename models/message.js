const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');

const Message = sequelize.define('Message', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
});

User.hasMany(Message, { foreignKey: 'userId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = Message;