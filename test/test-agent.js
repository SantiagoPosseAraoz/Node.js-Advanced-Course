'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire= require('proxyquire')

let config = {
    loggin : function(){}
}

let MetricStub = {
    belongsTo : sinon.spy()
}
let AgentStub = null
let db = null
let sandbox = null

test.beforeEach(async()=>{
    sandbox = sinon.createSandbox()
    AgentStub = {
        hasMany : sandbox.spy()
    }
    const setupDatabase = proxyquire('../',{
        './models/Agent' : ()=>AgentStub,
        './models/Metric' : ()=>MetricStub,
    })

    db = await setupDatabase(config)
})

test.afterEach(()=>{
    sandbox && sandbox.restore()
})

test('Agent', t=>{
    t.truthy(db.Agent, 'Service should exist')
})

test.serial('Setup', t=>{
    t.true(AgentStub.hasMany.called, 'AgentModel.hasMany has been executed')
    t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the model')
    t.true(MetricStub.belongsTo.called, 'AgentModel.belongsTo has been executed')
    t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the model')
})

