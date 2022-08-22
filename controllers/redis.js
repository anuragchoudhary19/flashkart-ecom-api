const redis = require('redis');
let redisClient;
(async () => {
  try {
    redisClient = redis.createClient();
    await redisClient.connect();
  } catch (error) {
    console.log(error);
  }
})();
exports.getOrSetCache = (key, cb) => {
  return new Promise(async (resolve, reject) => {
    try {
      let oldData = await redisClient.get(key);
      if (oldData !== null) return resolve(JSON.parse(oldData));
      let freshData = await cb();
      await redisClient.set(key, JSON.stringify(freshData));
      return resolve(freshData);
    } catch (error) {
      return reject(error);
    }
  });
};
