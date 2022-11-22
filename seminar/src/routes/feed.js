const express = require('express');
const FeedModel = require('../models/feed');

const router = express.Router();

class FeedDB {
    static _inst_;
    static getInst = () => {
        if ( !FeedDB._inst_ ) FeedDB._inst_ = new FeedDB();
        return FeedDB._inst_;
    }

    //#id = 1; #itemCount = 1; #LDataDB = [{ id: 0, title: "test1", content: "Example body" }];

    constructor() { console.log("[Feed-DB] DB Init Completed"); }

    selectItems = async ( count ) => {
        try {
            if (count === 0) return { success: true, data: [] };
            const DBItemCount = await FeedModel.countDocuments();
            /*
            if (count > DBItemCount) return { success: false, data: "Too many items queried"  };
            if (count < 0) return { success: false, data: "Invalid count provided" };
            */
            const res = await FeedModel.find().sort({'createdAt': -1}).limit(count).exec();
            return { success: true, data: res };
        } catch (e) {
            console.log(`[Feed-DB] Select Error: ${ e }`);
            return { success: false, data: `DB Error - ${ e }` };
        }
    }

    insertItem = async( id, item ) => {
        const { title, content } = item;
        try {
            const newItem = new FeedModel({ id, title, content });
            const res = await newItem.save();
            return true;
        } catch (e) {
            console.log(`[Feed-DB] Insert Error: ${ e }`);
            return false;
        }
    }

    editItem = async ( id, item ) => {
        try {
            const { title, content } = item;
            const OUpdateFiler = { id: id };
            const res = await FeedModel.updateOne(OUpdateFiler, {$set: {title: title, content: content}});
            return true;
        } catch (e) {
            console.log(`[Feed-DB] Update Error: ${ e }`);
            return false;
        }
    }


    deleteItem = async ( _id ) => {
        try {
            const ODeleteFiler = { _id: _id };
            const res = await FeedModel.deleteOne(ODeleteFiler);
            return true;
        } catch (e) {
            console.log(`[Feed-DB] Delete Error: ${ e }`);
            return false;
        }
    }
}


const feedDBInst = FeedDB.getInst();

router.get('/getFeed', async(req, res) => {
    try {
        const requestCount = parseInt(req.query.count);
        const dbRes = await feedDBInst.selectItems(requestCount);
        if (dbRes.success) return res.status(200).json(dbRes.data);
        else return res.status(500).json({ error: dbRes.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/addFeed', async(req, res) => {
   try {
       const { id, title, content } = req.body;
       const addResult = await feedDBInst.insertItem(id, { title, content });
       if (!addResult) return res.status(500).json({ error: dbRes.data })
       else return res.status(200).json({ isOK: true });
   } catch (e) {
       return res.status(500).json({ error: e });
   }
});

router.post('/editFeed', async(req, res) => {
    try {
        const { id, title, content } = req.body;
        const editResult = await feedDBInst.editItem(parseInt(id), { title, content });
        if (!editResult) return res.status(500).json({ error: dbRes.data })
        else return res.status(200).json({ isOK: true });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
 });


router.post('/deleteFeed', async(req, res) => {
    try {
        const { _id } = req.body;
        console.log(_id);
        const deleteResult = await feedDBInst.deleteItem(_id);
        if (!deleteResult) return res.status(500).json({ error: "No item deleted" })
        else return res.status(200).json({ isOK: true });
    }catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;