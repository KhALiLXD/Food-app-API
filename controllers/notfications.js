    const getRedis = require('../config/redis')
    const { client: redis, ready } = getRedis()



    exports.notificationStream = async (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        req.setTimeout?.(0);

        await ready; 

        const userId = req.session.user.id;
        const userChannel = `notifications:${userId}`;
        const publicChannel = `notifications:broadcast`;

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
        await subscriber.subscribe(userChannel, (message) => onMsg(message, userChannel));
        await subscriber.subscribe(publicChannel, (message) => onMsg(message, publicChannel));

     




        req.on('close', async () => {
            await subscriber.unsubscribe(userChannel);
            await subscriber.unsubscribe(publicChannel);
            await subscriber.quit();
            res.end();
            console.log('Client disconnected from notifications');
        });

    }



    exports.publishBroadcast = async (req, res) => {
        try {
            const { message, type } = req.body;
            const publisher = redis.duplicate();
            await publisher.connect();

            if (type === 'broadcast') {
                // بدل ما نعمل publish، بنحط الرسالة في طابور (queue)
                await publisher.lPush('notifications-queue', message);
                res.status(200).json({ status: 'broadcast job added to queue' });
            } else {
                // لسه بنستخدم الـ publish للإشعارات الخاصة عشان توصل فوراً
                const channel = `notifications:${req.session.user.id}`;
                await publisher.publish(channel, message);
                res.status(200).json({ status: 'private notification sent directly' });
            }

        } catch (e) {
            console.error('Queue/Publish error:', e);
            res.status(500).json({ error: 'Failed to add message to queue or publish' });
        }
    };



    
exports.returantOrdersStream =  async (req,res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    req.setTimeout?.(0);

    await ready;
    const {restaurant_id} = req.params;
    const restaurantChannel = `restaurant:${restaurant_id}`;

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
    await subscriber.subscribe(restaurantChannel, (message) => onMsg(message, restaurantChannel));
    console.log(`Subscribed to ${restaurantChannel} for new orders`);
    req.on('close', async () => {
        await subscriber.unsubscribe(restaurantChannel);
        await subscriber.quit();
        res.end();
        console.log('Client disconnected from restaurant orders stream');
    });
    
}