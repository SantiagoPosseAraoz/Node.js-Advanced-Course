'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

const config = {
  loggin: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const single = Object.assign({}, agentFixtures.single)
const id = 1
const uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null

const uuidArgs = {
  where: {
    uuid
  }
}

const connectedArgs = {
  where: { connected: true }
}

const usernameArgs = {
  where: { username: 'platzi', connected: true }
}

const newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON () {
        return newAgent
      }
    })
  )

  // Model findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(single))

  // Model findById stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findAll
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.platzi))

  const setupDatabase = proxyquire('../', {
    './models/Agent': () => AgentStub,
    './models/Metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', (t) => {
  t.truthy(db.Agent, 'Service should exist')
})

test.serial('Setup', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany has been executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the model'
  )
  t.true(MetricStub.belongsTo.called, 'AgentModel.belongsTo has been executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the model'
  )
})

test.serial('Agent#findById', async (t) => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'Find by ID has been called')
  t.true(AgentStub.findById.calledOnce, 'Find by ID has been called ONCE')
  t.true(
    AgentStub.findById.calledWith(id),
    'Should be called with a specific ID'
  )
  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})

test.serial('Agent#CreateOrUpdate - existing', async (t) => {
  const agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'Agent.findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'Agent.findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'Agent.update should be called once')
  t.deepEqual(agent, single, 'Agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne called on Model')
  t.true(AgentStub.findOne.calledOnce, 'findOne called should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne should be called with uuid args')
  t.true(AgentStub.create.called, 'created should be called on Model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')
  t.deepEqual(agent, newAgent, 'agent should be the same')
})

test.serial('Agent#findByUiid', async t => {
  const agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne called on Model')
  t.true(AgentStub.findOne.calledOnce, 'findOne called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified args')
  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'Should be the same')
})

test.serial('Agent#findAll', async t => {
  const agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on Model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args')
  t.is(agents.length, agentFixtures.all.length, 'should be the same length')
  t.deepEqual(agents, agentFixtures.all, 'should be the same')
})

test.serial('Agent#findConnected', async t => {
  const agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with specified args')
  t.is(agents.length, agentFixtures.connected.length, 'should be the same length')
  t.deepEqual(agents, agentFixtures.connected, 'should be the same')
})

test.serial('Agent#findByUsername', async t => {
  const agent = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with specified args')
  t.is(agent.length, agentFixtures.platzi.length, 'should have the same lenght')
  t.deepEqual(agent, agentFixtures.platzi, 'should be the same')
})
