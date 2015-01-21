"use strict";

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
    content: DataTypes.TEXT,
    score: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    PostId: DataTypes.INTEGER,
    ParentCommentId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Comment.belongsTo(models.User);
      }
    }
  });

  return Comment;
};
