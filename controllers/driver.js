// const db = require('../config/db');
const getRedis = require('../config/redis')
const { client: redis, ready } = getRedis()
exports.driverLocationStream =  async (req,res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.timeout?.(0);
    const userId = req.session.user.id;
    const {driverId} = req.params;



    
    await ready;
    const driverChannel = `driver:${driverId}`;

    const subscriber = redis.duplicate();
    await subscriber.connect();
    const onMsg = (message, channel) => {
        try {
        const ts = Date.now();
        const frame = `id: ${ts}\nevent: message\ndata: ${message}\n\n`;
        res.write(frame);
        } catch (e) {
            console.error('SSE write error:', e);
        }
    };
    await subscriber.subscribe(driverChannel, (message) => onMsg(message, driverChannel));
    console.log(`Subscribed to ${driverChannel} for driver location updates`);
    req.on('close', async () => {
        await subscriber.unsubscribe(driverChannel);
        await subscriber.quit();
        res.end();
        console.log('Client disconnected from driver location stream');
    });


    // let location = null;

    
    // const intervalId = setInterval(() => {
    //     db.query(` SELECT d.location from orders AS o
    //         LEFT JOIN drivers as d
    //         on o.driver_id = d.id
    //         WHERE o.id = ? AND o.user_id = ? 
    //         `,[orderId, userId], (err, rows) => {
    //     if (err) {
    //         console.log(err);
    //         res.write(`data: ${JSON.stringify({ error: 'db error' })}\n\n`);
    //         return;
    //     }
    //     if (!rows || rows.length === 0) {
    //         res.write(`data: ${JSON.stringify({ error: 'No such order' })}\n\n`);
    //         clearInterval(intervalId);
    //          res.end();
    //         return;
    //     }
    //     if ( rows[0].location === location) return;
    //     location = rows[0].location;
    //     res.write(`location: ${JSON.stringify({ location })}\n\n`);
    // });
    // }, 3000); 


    // req.on('close', () => {
    //     // clearInterval(intervalId);
        
    //     res.end();
    //     console.log('Client disconnected');
    // });
}







exports.updateDriverLocation = async (req, res) => {

  const { driverId, location } = req.body;
   await ready;
     const publisher = redis.duplicate();
    await publisher.connect();
    const channel = `driver:${driverId}`;
    const message = `new location:${JSON.stringify({ driverId, location })}`;
    await publisher.publish(channel, message);
    console.log(`driver location update sent directly to ${channel}`);

//   db.query(`UPDATE drivers SET location = ? WHERE id = ?`, [JSON.stringify(location), driverId], (err, result) => {
//     if (err) {
//         console.log(err);
//         return res.status(500).json({ error: err });
//     } else {
//         return res.status(200).json({ message: 'Driver location updated successfully' });
//     }
//   });
};
