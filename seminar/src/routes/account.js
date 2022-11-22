const express = require('express');
const authMiddleware = require('../middleware/auth');
const AccountModel = require('../models/account');

const router = express.Router();

class BankDB {
    static _inst_;
    static getInst = () => {
        if ( !BankDB._inst_ ) BankDB._inst_ = new BankDB();
        return BankDB._inst_;
    }

    constructor() { 
        const AccountDB = new AccountModel({name: 'account', total: 10000});
        const res = AccountDB.save();
        console.log("[Bank-DB] DB Init Completed"); 
    }


    getBalance = async () => {
        const OFindFiler = { name: 'account' };
        const data = await AccountModel.findOne(OFindFiler);
        return { success: true, data: data.total };
    }

    transaction = async ( amount ) => {
        const OUpdateFiler = { name: 'account' };
        const data = await AccountModel.findOne(OUpdateFiler);
        const newTot = data.total + amount;
        const res = await AccountModel.updateOne(OUpdateFiler, {$set: {total: newTot }});
        return { success: true, data: data.total+amount };
    }
}

const bankDBInst = BankDB.getInst();

router.post('/getInfo', authMiddleware, async (req, res) => {
    try {
        const { success, data } = await bankDBInst.getBalance();
        if (success) return res.status(200).json({ balance: data });
        else return res.status(500).json({ error: data });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/transaction', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const { success, data } = await bankDBInst.transaction( parseInt(amount) );
        if (success) res.status(200).json({ success: true, balance: data, msg: "Transaction success" });
        else res.status(500).json({ error: data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;