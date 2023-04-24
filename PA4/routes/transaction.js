const express = require('express');
const router = express.Router();
const transactionItem = require('../models/transactionItem')
const User = require('../models/User')

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/transaction',
    isLoggedIn,
    async (req, res, next) => {
        const sortby = req.query.sortBy
        let items =[]
        if(sortby == "category"){
          items = await transactionItem.aggregate(
            [ 
              {userId:req.user._id},
              {$sort:{category:1}},              
            ])
            res.render('transaction',{items});
        }
        else if(sortby == "date"){
          items = await transactionItem.aggregate(
            [ 
              {userId:req.user._id},
              {$sort:{date:1}},              
            ])
            res.render('transaction',{items});
        }else if(sortby == "amount"){
          items = await transactionItem.aggregate(
            [ 
              {userId:req.user._id},
              {$sort:{amount:1}},              
            ])
            res.render('transaction',{items});
        }else if(sortby == "description"){
          items = await transactionItem.aggregate(
            [ 
              {userId:req.user._id},
              {$sort:{description:1}},              
            ])
            res.render('transaction',{items});
        }else{
          items = await transactionItem.find({userId:req.user._id})
            res.render('transaction',{items});
        }
        
    }
)

router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new transactionItem(
        {
          description:req.body.description,
          amount: parseInt(req.body.amount),
          category: req.body.category,
          date: req.body.date,
          userId: req.user._id
        })  
      await transaction.save();
      res.redirect('/transaction')
});

router.get('/transaction/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/remove/:itemId")
      await transactionItem.deleteOne({_id:req.params.itemId});
      res.redirect('/transaction')
});

router.get('/transaction/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/edit/:itemId")
      const item = 
      await transactionItem.findById(req.params.itemId);
      res.locals.item = item
      res.render('transactionupdate')
});

router.post('/transaction/update',
    isLoggedIn,
    async (req, res, next) => {
        console.log("inside /transaction/update/:itemId")
        const {itemId,description,category,amount,date} = req.body;
        await transactionItem.findOneAndUpdate({_id:itemId},{$set:{description,category,amount,date}})
        res.redirect('/transaction')
    }
    );

router.get('/transaction/groupbyCate',
  isLoggedIn,
  async (req, res, next) => {
    let results = 
      await transactionItem.aggregate([
        {$group: {_id: "$category", total: {$sum: "$amount"}}} 
    ])

        res.render('groupbyCate',{results})
});

module.exports = router;