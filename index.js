'use strict'
const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/Agent')
const setupMetricModel = require('./models/Metric')

module.exports = async function (config) {
  const sequelize = setupDatabase(config)
  const agentModel = setupAgentModel(config)
  const metricModel = setupMetricModel(config)

  agentModel.hasMany(metricModel)
  metricModel.belongsTo(agentModel)

  await sequelize.authenticate()

  sequelize.sync()

  const Agent = {}
  const Metric = {}

  return { Agent, Metric }
}
