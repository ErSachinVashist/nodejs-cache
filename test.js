const express = require('express');
const redis = require('redis');
const rClient = redis.createClient();
const fetch = require('node-fetch');

const app=express()

app.get("/repos/:username",getFromCache,getRepos)


app.listen(3000,function (err) {
    if(err) return console.log(err)
    console.log('Server is listening on 3000')
})

function getFromCache(req,res,next){
    const {username}=req.params
    rClient.get(username,(err,data)=>{
        if(err) throw err;
        if(data!=null){
            console.log("form cache")
            res.send(`<h1>${data}</h1>`)
        }
        else{
            console.log("form hit")
            next()
        }
    })
}

async function getRepos(req,res,next) {
    const {username}=req.params
    try{
        //fetching git repo
        const gitRepos=await fetch(`https://api.github.com/users/${username}`);
        const repoJson=await gitRepos.json();
        rClient.set(username, repoJson.public_repos, 'EX', 3600);
        res.send(`<h1>${repoJson.public_repos}</h1>`)
    }
    catch(err){
    console.log(err)
    }
}
