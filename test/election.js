'use strict'

const lab = exports.lab = require('lab').script()
const describe = lab.experiment
const before = lab.before
const after = lab.after
const it = lab.it
const expect = require('code').expect

const async = require('async')
const levelup = require('levelup')
const memdown = require('memdown')

const Node = require('../')

const A_BIT = 1000

describe('election', () => {
  let followers, leader

  const nodeAddresses = [
    '/ip4/127.0.0.1/tcp/9090',
    '/ip4/127.0.0.1/tcp/9091',
    '/ip4/127.0.0.1/tcp/9092'
  ]

  const nodes = nodeAddresses.map(address => new Node(address, {
    db: memdown
  }))

  before(done => {
    async.each(nodes, (node, cb) => node.start(cb), done)
  })

  after(done => {
    async.each(nodes, (node, cb) => node.stop(cb), done)
  })

  it('can join another node', done => {
    nodes.forEach((node, index) => {
      const selfAddress = nodeAddresses[index]
      const peers = nodeAddresses.filter(address => address !== selfAddress)
      peers.forEach(peer => node.join(peer))
    })
    done()
  })

  it('waits a bit', done => setTimeout(done, A_BIT))

  it('one of the nodes gets elected', done => {
    leader = nodes.find(node => node.is('leader'))
    followers = nodes.filter(node => node.is('follower'))
    expect(followers.length).to.equal(2)
    expect(leader).to.not.be.undefined()
    expect(followers.indexOf(leader)).to.equal(-1)
    done()
  })

  it('waits a bit', done => setTimeout(done, A_BIT))

  it('still the same', done => {
    const followers2 = nodes.filter(node => node.is('follower'))
    const leader2 = nodes.find(node => node.is('leader'))
    expect(followers2.length).to.equal(2)
    expect(leader2 === leader).to.equal(true)
    expect(followers2.indexOf(leader2)).to.equal(-1)
    done()
  })

})
