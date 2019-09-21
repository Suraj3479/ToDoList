const express = require('express');
const bodyParser = require('body-parser');
//const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,
useUnifiedTopology: true});
const ItemSchema={
    name:String
};
const Item = mongoose.model("Item",ItemSchema);
const Item1 = new Item({
    name:"Eat Food"
});
const Item2 = new Item({
    name:"Study Maths"
});
const Item3 = new Item({
    name:"Write Letter"
});

const defaultArray = [Item1,Item2,Item3];
const listSChema = {
    name: String,
    item:[ItemSchema]
};

const List = mongoose.model("List",listSChema);

app.get("/",function(req,res){
    todaydate = "Today";
    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultArray,function(err){
                 if(err){
                     console.log("Some error occured");
                 }else{
                     console.log("Inserted into database successfully!!!");
                 }
             });
             res.render("List",{kindOfDay:todaydate,Newitem:foundItems});
        }else{
            res.render("List",{kindOfDay:todaydate,Newitem:foundItems});
        }
    });    
});

app.post("/",function(req,res){
    let ItemName = req.body.nitem;
    const listItem = req.body.list;
    
    const Itemnew  = new Item({
        name:ItemName
    }); 

    if(listItem === "Today"){
        Itemnew.save();
        res.redirect("/");
    }else{
        List.findOne({name:listItem},function(error,foundList){
            foundList.item.push(Itemnew);
            foundList.save();
            res.redirect("/"+listItem);
        })
    }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log("some error occured");
            }else{
                res.redirect("/");
            }
        }); 
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItemId}}},function(error,foundList){
            if(!error){
                res.redirect("/"+listName);
            }
        })
    }
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(error,result){
        if(!error){
            if(!result){
                const list = new List({
                    name:customListName,
                    item:defaultArray
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("List",{kindOfDay:result.name,Newitem:result.item});
            }
        }
    });
});
app.listen(3000,function(){
    console.log("server started");
});