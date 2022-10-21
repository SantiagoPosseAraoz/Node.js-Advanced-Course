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

let single = Object.assign({}, agentFixtures.single);
let id = 1;
let uuid = "yyy-yyy-yyy";
let AgentStub = null;
let db = null;
let sandbox = null;

let uuidArgs = {
  where: {
    uuid,
  },
};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  //Model findOne stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(single));

  //Model findById stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  //Model create stub
  AgentStub.update = sandbox.stub();
  AgentStub.update
    .withArgs(single, uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)));

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
  t.true(
    AgentStub.findById.calledWith(id),
    "Should be called with a specific ID"
  );
  t.deepEqual(agent, agentFixtures.byId(id), "Should be the same");
});

test.serial("Agent#CreateOrUpdate - existing", async (t) => {
  let agent = await db.Agent.createOrUpdate(single);

  t.true(AgentStub.findOne.called, "Agent.findOne should be called");
  t.true(AgentStub.findOne.calledTwice, "Agent.findOne should be called twice");
  t.true(AgentStub.update.calledOnce, "Agent.update should be called once");
  t.deepEqual(agent, single, "Agent should be the same");
});
