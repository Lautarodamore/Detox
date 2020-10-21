const Instance = require('./dto/GenyInstance');

class GenyInstancesService {
  constructor(genyCloudExec, deviceRegistry) {
    this.genyCloudExec = genyCloudExec;
    this.deviceRegistry = deviceRegistry;
  }

  async findFreeInstance(recipeName) {
    const instances = await this._getInstancesOfRecipe(recipeName);
    const freeInstances = instances.filter(this._isInstanceFree);
    return (freeInstances[0] || null);
  }

  async launchInstance(recipeName) {
    const now = new Date().getTime();
    const instance = await this.genyCloudExec.startInstance(recipeName, now).instance;
    return new Instance(instance);
  }

  async connectInstance(instanceUUID) {
    const connectedInstance = await this.genyCloudExec.adbConnect(instanceUUID).instance;
    return new Instance(connectedInstance);
  }

  async stopInstance(instanceUUID) {
    return this.genyCloudExec.stopInstance(instanceUUID);
  }

  async _getInstancesOfRecipe(recipe) {
    const result = await this._getAllInstances();
    return (result.instances || []).filter(instance => instance.recipe.uuid === recipe.uuid);
  }

  async _getAllInstances() {
    return this
      .genyCloudExec.getInstances()
      .map((rawInstance) => new Instance(rawInstance));
  }

  _isInstanceFree(instance) {
    if (!instance.isAdbConnected()) {
      return instance;
    }
    return !this.deviceRegistry.isDeviceBusy(instance.adbName);
  }
}

module.exports = GenyInstancesService;
