"use strict";

module.exports = function setupMetric(MetricModel, AgentModel) {
  async function findByAgentUuid(uuid) {
    return MetricModel.findAll({
      atributtes: ["type"],
      group: ["type"],
      include: [
        {
          atributtes: [],
          model: AgentModel,
          where: {
            uuid,
          },
        },
      ],
      raw: true,
    });
  }

  async function findByTypeAgentUuid(type, uuid) {
    return MetricModel.findAll({
      atributtes: ["id", "value", "type", "createdAt"],
      where: {
        type,
      },
      limit: 20,
      order: [["createdAt", "DESC"]],
      include: [
        {
          atributtes: [],
          model: AgentModel,
          where: { uuid },
        },
      ],
      raw: true,
    });
  }

  async function create(uuid, metric) {
    const agent = await AgentModel.findOne({ where: uuid });

    if (agent) {
      Object.assign(metric, { agentId: agent.id });
      const result = await MetricModel.create(metric);
      return result.toJSON();
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid,
  };
};
