const redis = require('redis');
let redisClient;
(async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      redisClient = redis.createClient({ url: process.env.REDIS_URL });
    } else {
      redisClient = redis.createClient();
    }
    await redisClient.connect();
  } catch (error) {
    console.log(error);
  }
})();

exports.getOrSetCache = (key, cb) => {
  return new Promise(async (resolve, reject) => {
    try {
      let oldData = await redisClient.get(key);
      if (oldData !== null) {
        return resolve(JSON.parse(oldData));
      }
      let freshData = await cb();
      await redisClient.set(key, JSON.stringify(freshData));
      return resolve(freshData);
    } catch (error) {
      return reject(error);
    }
  });
};
exports.analytics = async (ip) => {
  try {
    let newData = { ip: ip, timestamp: new Date() };
    await redisClient.rPush('ips:flashkart', JSON.stringify(newData));
  } catch (error) {
    console.log(error);
  }
};
