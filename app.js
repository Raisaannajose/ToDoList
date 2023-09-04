const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true,useFindAndModify: false });

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your ToDoList!"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(results.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  
  })
  // const day = date.getDate();
    
  });

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const title=req.body.list;

  const item=new Item({
    name: newItem
  })
  if(title==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:title},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+title);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted the item");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(err){
        res.redirect("/"+listName);
      }
    });
  }

})

app.get("/:whatever", (req, res) => {
  const customListName = _.capitalize(req.params.whatever);
  List.findOne({name: customListName}, (err, result) => {
    if (!err) {
      if (!result) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        });
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


