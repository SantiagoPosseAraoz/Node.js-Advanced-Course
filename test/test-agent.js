"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const agentFixtures = require("./fixtures/agent");

let config = {
  loggin: function () {},
};

let MetricStub = {
  belongsTo: sinon.spy(),
};

let id = 1;
let AgentStub = null;
let db = null;
let sandbox = null;

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  const setupDatabase = proxyquire("../", {
    "./models/Agent": () => AgentStub,
    "./models/Metric": () => MetricStub,
  });

  db = await setupDatabase(config);
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

test("Agent", (t) => {
  t.truthy(db.Agent, "Service should exist");
});

test.serial("Setup", (t) => {
  t.true(AgentStub.hasMany.called, "AgentModel.hasMany has been executed");
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    "Argument should be the model"
  );
  t.true(MetricStub.belongsTo.called, "AgentModel.belongsTo has been executed");
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "Argument should be the model"
  );
});

test.serial("Agent#findById", async (t) => {
  let agent = await db.Agent.findById(id);

  t.true(AgentStub.findById.called, "Find by ID has been called");
  t.true(AgentStub.findById.calledOnce, "Find by ID has been called ONCE");
  t.true(AgentStub.findById.calledWith(id), "Should be called with a specific ID");
  t.deepEqual(agent, agentFixtures.byId(id), "Should be the same");
});
