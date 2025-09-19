const db = require('../config/db');

exports.getUserPayment =  (req,res) => {

    const userId = req.session.user.id;  
    db.query('SELECT payment_method, payment_details FROM paymentMethods WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'db error' });
        }
        const user_payment = rows;
        if (!user_payment) return res.status(404).json({ message: 'data not found' });

        return res.json({ user_payments: user_payment});
    });
}



exports.addUserPayment = (req,res) =>{
    const userId = req.session.user.id;  
    const { payment_method, payment_details } = req.body;

    if (!payment_method || !payment_details) {
        return res.status(400).json({ message: 'payment_method and payment_details are required' });
    }

    db.query('INSERT INTO paymentMethods (user_id, payment_method, payment_details) VALUES (?, ?, ?)', [userId, payment_method, payment_details], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'db error' });
        }
        return res.status(201).json({ message: 'Payment added successfully', paymentId: result.insertId });
    });
}

exports.updateUserPayment =  (req, res) => {
    // const { username, email, password, phone_number, location, country } = req.body;
    const userId = req.session.user.id;  
    const COLUMNS = new Set(['payment_method', 'payment_details'])



    const filtered = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => COLUMNS.has(k))
    );
    if (Object.keys(filtered).length === 0) return res.status(400).json({ error: "No valid changes" });

    const set = [];
    const parms = [];


    for (const [col,value] of Object.entries(filtered)){
        if(COLUMNS.has(col)){
            set.push(`${col}= ?`) 
            parms.push(value)
        }
    }
    


     if (set.length === 0) {
        return res.status(400).json({ error: "No valid changes" });
    }
    const sql = `UPDATE paymentMethods SET ${set.join(', ')} WHERE id = ? `;

    db.query(sql,[...parms,userId],(err,data)=>{

        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'db error' });
        }
        if (data?.affectedRows === 0) return res.status(404).json({ message: 'user not found' });

        res.json({
            success: true,
            message: "user updated successfully",
            data: data
        })

    })


    // db.query('UPDATE users SET username = ?, email = ?, password = ?, phone_number = ?, location = ?, country = ? WHERE id = ?', [username, email, password, phone_number, location, country, userId], (err, result) => {
        // if (err) {
        //     console.log(err);
        //     return res.status(500).json({ message: 'db error' });
        // }
        // if (result.affectedRows === 0) return res.status(404).json({ message: 'user not found' });

    //     return res.json({ message: 'user updated successfully' });
    // });
}
