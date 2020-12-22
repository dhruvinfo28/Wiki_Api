const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect('mongodb://localhost/wikiDB', {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = mongoose.Schema({
    title: String,
    content: String
})

const articleModel = mongoose.model("article",articleSchema)

// app.get('/articles',(req,res)=>{ //get http verb use , route /articles fetches all articles in our database
//     articleModel.find({},(err,data)=>{
//         if(err){
//             // console.log(err)
//             res.send(err)
//         }
//         else{
//             // console.log(data)
//             res.send(data)
//         }
//     })
// })
// app.post('/articles',(req,res)=>{ //Earlier we need to setup a form that will make a post request to our server ,and then we will add the new data to our databse , but here the client can be various things apart from only being the html web page , so we will save ourselves an effort and make a post request via postman
//     //browser can only make get requests, rest all requests we gonna make using postman
//     let newEntry = new articleModel({
//         title: req.body.title,
//         content: req.body.content
//     })
//     newEntry.save((err)=>{
//         if(!err){
//             res.send("Successfully added a new article")
//         }
//         else{
//             res.send(err);
//         }
//     });
// })

// app.delete("/articles",(req,res)=>{
//     articleModel.deleteMany((err)=>{
//         if(!err){
//             res.send("Succesfulle deleted all articles")
//         }
//         else{
//             res.send(err)
//         }
//     })
// })

//Refactoring the above code using chainable route handlers
app.route("/articles")
    .get((req,res)=>{
        articleModel.find({},(err,data)=>{
            if(err){
                res.send(err)
            }
            else{
                res.send(data)
            }
        })
    })
    .post((req,res)=>{
            let newEntry = new articleModel({
                title: req.body.title,
                content: req.body.content
            })
            newEntry.save((err)=>{
                if(err){
                    res.send(err)
                }
                else{
                    res.send("New article saved")
                }
            })  
    })
    .delete((req,res)=>{
        articleModel.deleteMany({},(err)=>{
            if(err){
                res.send(err)
            }
            else{
                res.send("Successfully deleted all articles")
            }
        })
    }); //This semicolon is important to cap the chaining
//Handling requests targetting a specific article
app.route("/articles/:title")
    .get((req,res)=>{
        articleModel.findOne({title:req.params.title},(err,data)=>{
            if(err){
                res.send(err);
            }
            else{
                if(!data){
                    res.send("No article found")
                }
                else{
                    res.send(data);
                }
            }
        })
    })
    .put((req,res)=>{
        //Updating a specific article, put means entirely overwrititng with a new doc evenif we have changes in specific properties and not all
        articleModel.replaceOne(
            {title:req.params.title},
            {title: req.body.title, content: req.body.content}, //update info , from the put request body
            {omitUndefined:false}, //Removes undefined properties from the document
            //For put we completely want to overwrite the document, so if we didnt give any title in the put request then the replace(omitUndefined prop) will remove the title from the new doc 
            (err)=>{
                if(err){
                    res.send(err)
                }else{
                    res.send("Successfully updated the article")
                }
            }
        )
    })
    .patch((req,res)=>{
        articleModel.updateOne(
            {title:req.params.title},
            {$set:req.body}, //User might wanna change title or content or both , so to keep it dynamic we can give it like this
            //req.body = {
            //     title: "test",
            //     content: "dfsf",
            // } This is how it looks if user wants to change both,
            (err)=>{
                if(err){
                    res.send(err);
                }
                else{
                    res.send("Successfully updated the article")
                }
            }
        )
    })
    .delete((req,res)=>{
        articleModel.deleteOne(
            {title:req.params.title},
            (err)=>{
                if(!err){
                    res.send("Successfully deleted the article")
                }else{
                    res.send(err)
                }
            }
        )
    })

app.listen('3000',()=>{
    console.log("App listening")
})