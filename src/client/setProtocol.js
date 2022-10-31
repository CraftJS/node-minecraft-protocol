'use strict'

const states = require('../states')

module.exports = function (client, options) {
  client.on('connect', onConnect)

  function onConnect () {
    if (client.wait_connect) {
      client.on('connect_allowed', next)
    } else {
      next()
    }

    function next () {
      let taggedHost = options.host
      if (client.tagHost) taggedHost += client.tagHost
      if (client.fakeHost) taggedHost = options.fakeHost

      client.write('set_protocol', {
        protocolVersion: options.protocolVersion,
        serverHost: taggedHost,
        serverPort: options.port,
        nextState: 2
      })
      client.state = states.LOGIN
      const mcData = require('minecraft-data')(client.version)
      client.write('login_start', {
        username: client.username,
        signature: client.profileKeys
          ? {
              timestamp: BigInt(client.profileKeys.expiresOn.getTime()), // should probably be called "expireTime"
              publicKey: client.profileKeys.publicDER,
              signature: mcData.supportFeature("signatureV2") ? client.profileKeys.signatureV2 : client.profileKeys.signature
            }
          : null,
        playerUUID: client.uuid ?? null
      })
    }
  }
}
