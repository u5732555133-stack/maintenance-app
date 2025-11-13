const { expect } = require('chai');
const { zoneConfigs } = require('../src/multiZoneConfig');

describe('Multi-Zone Configuration', () => {
  describe('Zone Configs', () => {
    it('should have all 4 zones defined', () => {
      expect(zoneConfigs).to.have.property('zone1');
      expect(zoneConfigs).to.have.property('zone2');
      expect(zoneConfigs).to.have.property('zone3');
      expect(zoneConfigs).to.have.property('zone4');
    });

    it('should have valid project IDs for all zones', () => {
      Object.values(zoneConfigs).forEach((config) => {
        expect(config).to.have.property('projectId');
        expect(config.projectId).to.be.a('string');
        expect(config.projectId).to.include('maintenance-zone');
      });
    });

    it('should have unique project IDs', () => {
      const projectIds = Object.values(zoneConfigs).map(c => c.projectId);
      const uniqueIds = [...new Set(projectIds)];
      expect(uniqueIds).to.have.lengthOf(4);
    });

    it('should have database URLs for all zones', () => {
      Object.values(zoneConfigs).forEach((config) => {
        expect(config).to.have.property('databaseURL');
        expect(config.databaseURL).to.be.a('string');
        expect(config.databaseURL).to.include('firebaseio.com');
      });
    });
  });
});
