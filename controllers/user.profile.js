const db = require('../config/db');

exports.getUserProfile =  (req,res) => {

    const userId = req.session.user.id;  
    db.query('SELECT username, email, phone_number, location, country FROM users WHERE id = ?', [userId], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'db error' });
        }
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'user not found' });

        return res.json({ user });
    });
}


exports.updateUserProfile =  (req, res) => {
    // const { username, email, password, phone_number, location, country } = req.body;
    const userId = req.session.user.id;  
    const COLUMNS = new Set(['username', 'email', 'password', 'phone_number', 'location', 'country'])



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
    const sql = `UPDATE users SET ${set.join(', ')} WHERE id = ? `;

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
