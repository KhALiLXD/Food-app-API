const db = require('../config/db');
const getRedis = require('../config/redis')
const { client: redis, ready } = getRedis()

exports.orderStatusStream =  (req,res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const userId = req.session.user.id;
    const {orderId} = req.params;

    
    let status = 'unassigned';
    const intervalId = setInterval(() => {
        db.query(`SELECT status FROM orders WHERE id = ? AND user_id = ?`,[orderId, userId], (err, rows) => {
        if (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ error: 'db error' })}\n\n`);
            return;
        }
        if (!rows || !rows[0]) {
            res.write(`data: ${JSON.stringify({ error: 'order not found' })}\n\n`);
            return;
        }
        if (rows[0]?.status === status) return;
        status = rows[0].status;
        res.write(`data: ${JSON.stringify({ status })}\n\n`);
    });
    }, 30 * 1000); 


    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
        console.log('Client disconnected');
    });
}


exports.getOrderDetails = (req,res) =>{
    const {orderId} = req.params;
    const userId = req.session.user.id
    db.query(`SELECT
        o.id           AS order_id,
        o.name,
        o.details,
        o.status,
        d.location,
        d.full_name    AS driver_name,
        d.vehicle_type
        FROM orders AS o
        LEFT JOIN drivers AS d
        ON d.id = o.driver_id
        WHERE o.user_id = ? AND o.id = ?;
`,[userId,orderId],(err,data)=>{
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
        }  

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const row = data[0]
        console.log(row)
        const location = row.location ? JSON.parse(row.location) : null;
        res.json({...row, location})
    })
}



exports.createOrder = async (req, res) => {
    const userId = req.session.user.id;
    const { name, details,restaurant_id  } = req.body;
    
    await ready;
     const publisher = redis.duplicate();
    await publisher.connect();
    const channel = `restaurant:${restaurant_id}`;
    const message = `new order:${JSON.stringify({ userId, name, details, restaurant_id })}`;
    await publisher.publish(channel, message);
    console.log(`order notification sent directly to ${channel}`);

    db.query(`INSERT INTO orders (user_id, name, details, restaurant_id) VALUES (?, ?, ?, ?)`, [userId, name, details,restaurant_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
        } else {
            return res.status(201).json({ message: 'Order created successfully', orderId: result.insertId });
        }
    });

}
