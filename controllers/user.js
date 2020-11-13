const User = require("../models/user");
const _ =require("lodash");
const formidable = require("formidable");
const fs = require("fs");

const createUser = (req,res)=>{
    const {name,UserName,email,password}=req.body;
    const user =new User({name,UserName,email,password});
    user.save((err,user)=>{
        err? res.json({error:err}):res.json(user)
    }
    );
};

const deleteUser = (req,res)=>{

    let user = req.profile;
    user.remove((err,deleteUser)=>{
        if(err) res.json({error:err});
        res.json({message:"Compte deleted"})
    })
};

const getUserPhoto = (req,res)=>{

    if(req.profile.image.data){
        res.set("Content-Type",req.profile.image.contentType);
        return res.send(req.profile.image.data);
    }else{
        return res.sendFile("")
    }
};

const getAllUsers = (req,res)=>{
User.find((err,users)=>{
    if(err||!users) res.json({error:err});
    res.json(users);
}).select("name UserName email about image createdAt");
};

const updateUser = (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err,fields,files)=>{
        if(err) res.json({error:err+"imposible add photo"});
        let user = req.profile;
        user = _.extend(user,fields);
        if(files.image){
            user.image.data = fs.readFileSync(files.image.path);
            user.image.contentType =files.image.type;
        }
        user.save((err,result)=>{
            if(err) res.json({error:err});
            result.hashed_password = undefined;
            result.salt = undefined;
             res.json(result);
        })
    })
}
const getUserById = (req,res,next,id)=>{
 User.findById(id)
 .populate("following","_id name")
 .populate("followers","_id name")
 .exec((err,user)=>{
    err || !user ? res.json({error:err})
    :req.profile = user;
    next();
 });
};
const addFollower = (req,res,next)=>{
    User.findByIdAndUpdate(req.body.followId,
        {$push:{followers:req.body.userId}},{new:true},
        ((err,result)=>{
    if(err) res.json({error:err});
            next();
        }))

}

const addFollowing = (req,res,next)=>{
    User.findByIdAndUpdate(req.body.userId,
        {$push:{following:req.body.followId}},{new:true},
        )
        .populate("following","_id UserName")
        .populate("followers","_id UserName")
        .exec((err,result)=>{
            if(err) res.json({error : err});
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);
        })
};

const removeFollowing = (req,res,next)=>{
    User.findByIdAndUpdate(req.body.userId,
        {$pull:{following:req.body.unfollowId}},{new:true},
        ((err,result)=>{
    if(err) res.json({error:err});
            next();
        }));
};

const removeFollower = (req,res,next)=>{
    User.findByIdAndUpdate(req.body.unfollowId,
        {$pull:{followers:req.body.userId}},{new:true},
        ) 
        .populate("following","_id UserName")
        .populate("followers","_id UserName")
        .exec((err,result)=>{
            if(err) res.json({error : err});
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);
        })
};

const getUser = (req,res)=>{
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    res.json(req.profile);
};
module.exports = {
    createUser,
    getUserById,
    getUser,
    getUserPhoto,
    updateUser,
    getAllUsers,
    deleteUser,
    removeFollowing,
    removeFollower,
    addFollower,
    addFollowing
}