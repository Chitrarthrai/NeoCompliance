const Store = require("../models/store-model"); // adjust path if different

const storeService = {
  async addUserToStore(storeId, userId) {
    return await Store.findByIdAndUpdate(
      storeId,
      { $addToSet: { "assigned_users.associates": userId } },
      { new: true }
    );
  },

  async getStoreById(storeId) {
    return await Store.findById(storeId);
  },

  async validateStoreIds(storeIds = []) {
    const stores = await Store.find({ _id: { $in: storeIds } });
    return stores.length === storeIds.length;
  },
};

module.exports = storeService;
