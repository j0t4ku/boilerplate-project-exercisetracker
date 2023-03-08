const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
//conect to mongo atlas
mongoose.connect(process.env.MONGOOSE_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true}
});

let Users= mongoose.model('Users',UserSchema)

const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration:  Number,
  date:  Date
});

let Exercise= mongoose.model('Exercises',ExerciseSchema)


//Function create newuser
app.post('/api/users',(req,res)=>{
  //get dates
  let username= req.body.username
  //user void error
  if(username==="") return res.json({error:"El username esta vacio"})
  //instance userschema
  let newUser= new Users({
    username: username
  });
  //save newUser
  newUser.save()
    .then(savedUser =>res.json({_id: savedUser._id, username: savedUser.username}))
    .catch(err=>res.json({error:"Error al guardar los datos"}))
      
});

//Function list all user
app.get('/api/users',(req,res)=>{
  Users.find({},'-__v')
  .then(doc => res.json(doc)) 
  .catch(err => res.json(err))
});


//Fucntion /api/users/:_id/exercises
app.post('/api/users/:_id/exercises',(req,res)=>{
  //get id, and body.dates
  const userId= req.params._id;
  const description= req.body.description;
  const duration= req.body.duration;
  //get date if exist and now date if not
  const date = req.body.date ? new Date(req.body.date) : new Date();
  Users.findById(userId)
  .then(doc=>{
    if(!doc) return res.json({error: 'User not found'});

    //create instance of excercise
    const newExcercise= new Exercise({
      username: doc.username,
      description:description,
      duration:duration,
      date:date
    });

    //save newExcercise
    newExcercise.save()
    .then(docExcercises => res.json({
      _id: doc._id,
      username: docExcercises.username,
      description: docExcercises.description,
      duration: docExcercises.duration,
      date: docExcercises.date.toDateString()
    }))
    .catch(err=>res.json(err))

  })
  .catch(err=> res.json({error: err}));

});

//fucntion list excercise for uiser_id
app.get('/api/users/:_id/logs',(req,res)=>{
  //get user id
  const userId= req.params._id;

  Users.findById({_id:userId})
  .then(doc=>{
    //if not foun user
    if(!doc) return res.send('User not found');

    Exercise.find({username: doc.username})
    .then( docExcercises =>{
      console.log(docExcercises);
      res.status(200).json({
        _id:doc._id,
        username:doc.username,
        count:docExcercises.length,
        log:docExcercises.map(excercises=>({
          description:excercises.description,
          duration:excercises.duration,
          date:excercises.date.toDateString()
        }))
        
      })
    })
    .catch(err=> res.send(err))
  })
  .catch(err=> res.send(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
