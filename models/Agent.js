'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupAgentModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('agent', {
    uuid: { type: Sequelize.STRING, alowNull: false },
    username: { type: Sequelize.STRING, alowNull: false },
    name: { type: Sequelize.STRING, alowNull: false },
    hostname: { type: Sequelize.STRING, alowNull: false },
    pid: { type: Sequelize.INTEGER, alowNull: false },
    conmected: { type: Sequelize.BOOLEAN, alowNull: false, defaultValue: false }
  })
}
