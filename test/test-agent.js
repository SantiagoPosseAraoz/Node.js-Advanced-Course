'use strict'

const test = require('ava')
const proxyquire= require('proxyquire')

let config = {
    loggin : function(){}
}

let MetricStub = {
    belongsTo : function(){}
}
let AgentStub = null
let db = null

test.beforeEach(async()=>{
    AgentStub = {
        hasMany : function(){}
    }
    const setupDatabase = proxyquire('../',{
        './models/Agent' : ()=>AgentStub,
        './models/Metric' : ()=>MetricStub,
    })

    db = await setupDatabase(config)
})

test('Agent', t=>{
    t.truthy(db.Agent, 'Service should exist')
})

