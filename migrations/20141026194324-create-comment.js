"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      content: {
        type: DataTypes.TEXT
      },
      score: {
        type: DataTypes.INTEGER
      },
      UserId: {
        type: DataTypes.INTEGER,
        foreignKey:true
      },
      PostId: {
        type: DataTypes.INTEGER,
        foreignKey:true
      },
      ParentCommentId: {
        type: DataTypes.INTEGER,
        foreignKey:true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Comments").done(done);
  }
};