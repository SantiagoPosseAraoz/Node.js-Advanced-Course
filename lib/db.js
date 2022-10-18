'use stict'

const Sequelize = require('sequelize')
let sequelize = null

module.exports = function (configDb) {
  if (!sequelize) {
    sequelize = new Sequelize(configDb)
  }
  return sequelize
}
