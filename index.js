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
  //Obtener datos
  let username= req.body.username
  //si el username esta vacio retorna el error
  if(username==="") return res.json({error:"El username esta vacio"})
  //instancia de userschema
  let newUser= new Users({
    username: username
  });
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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
