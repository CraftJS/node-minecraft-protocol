const ITERATIONS = 10000;

const mc = require('../');
const { states } = mc;

const testDataWrite = [
  { name: 'keep_alive', params: { keepAliveId: 957759560 } },
  { name: 'chat', params: { message: '<Bob> Hello World!' } },
  { name: 'position_look', params: { x: 6.5, y: 65.62, stance: 67.24, z: 7.5, yaw: 0, pitch: 0, onGround: true } }
  // TODO: add more packets for better quality data
];


const { firstVersion,lastVersion } = require('./common/parallel');
console.log({ firstVersion,lastVersion });

mc.supportedVersions.forEach(function(supportedVersion,i) {
  if(!(i >= firstVersion && i <= lastVersion))
    return;
  
  const mcData = require('minecraft-data')(supportedVersion);
  const { version } = mcData;
  describe('benchmark ' + version.minecraftVersion,function() {
    this.timeout(60 * 1000);
    const inputData = [];
    it('bench serializing',function(done) {
      const serializer = new mc.createSerializer({ state: states.PLAY,isServer: false,version: version.minecraftVersion });
      let start, i, j;
      console.log('Beginning write test');
      start = Date.now();
      for(i = 0; i < ITERATIONS; i++) {
        for(j = 0; j < testDataWrite.length; j++) {
          inputData.push(serializer.createPacketBuffer(testDataWrite[j]));
        }
      }
      const result = (Date.now() - start) / 1000;
      console.log('Finished write test in ' + result + ' seconds');
      done();
    });

    it('bench parsing',function(done) {
      const deserializer = new mc.createDeserializer({ state: states.PLAY,isServer: true,version: version.minecraftVersion });
      console.log('Beginning read test');
      start = Date.now();
      for (let j = 0; j < inputData.length; j++) {
        deserializer.parsePacketBuffer(inputData[j]);
      }
      console.log('Finished read test in ' + (Date.now() - start) / 1000 + ' seconds');
      done();
    });
  });
});
