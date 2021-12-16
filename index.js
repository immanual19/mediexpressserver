const express = require('express')
const app = express()
const bodyParser=require('body-parser');
const { ObjectId } = require('bson');
const cors=require('cors');
app.use(cors())
app.use(bodyParser.json());
const port = 8080
const  MongoClient  = require('mongodb').MongoClient;
const uri = "mongodb+srv://immanual1:iAmbondoo7@cluster0.q17pz.mongodb.net/mediExpress?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

MongoClient.connect(uri, function(err, client) {
  //Sign up New User
  app.post('/signup',(req,res)=>{
    const userInfo=req.body;
    const usersCollection = client.db("mediExpress").collection("allUsers");
    usersCollection.find({"Email":userInfo.Email})
    .toArray((err,documents)=>{
      if(documents.length==0){
        usersCollection.insertOne(userInfo)
        .then(result=>{
          res.send(result.acknowledged)
        })
      }
      else{
        res.send(false);
      }


})
})
//Login Existing User
app.post('/login',(req,res)=>{
  const userInfo=req.body;
  const usersCollection = client.db("mediExpress").collection("allUsers");
  
  usersCollection.find({"Email":userInfo.Email,"Passowrd":userInfo.Passowrd})
  .toArray((err,documents)=>{
    if(documents.length!=0){
      res.send(documents);
    }
    else{
      res.send(false);
    }
  })

})
//Posting the whole Prescription
app.post('/postprescription',(req,res)=>{
  const userPrescription=req.body;
  const prescriptionCollection=client.db("mediExpress").collection("allPrescriptions");
  prescriptionCollection.insertOne(userPrescription)
  .then(result=>{
    res.send(result.acknowledged)
  })
})

//Posting Reports by Numbers

app.post('/postreportnumber',(req,res)=>{
  const data=req.body;
  const newData=req.body.dataArray[0];
  //console.log(newData);
  const reportByNumberCollection = client.db("mediExpress").collection("userReportByNumber");
  reportByNumberCollection.find({"Email":data.Email,"TestType":data.TestType})
  .toArray((err,documents)=>{
    if(documents.length===0){
      reportByNumberCollection.insertOne(data);
      res.send(true);
    }
    else{
      reportByNumberCollection.findOneAndUpdate({Email:data.Email,TestType:data.TestType},{
        $push:{
          dataArray:newData
        }
      })
      res.send(true);
    }
  })
})

//Showing medical history image by type

app.post('/showspecifictest',(req,res)=>{
  const data=req.body;
  console.log(data);
  const reportByNumberCollection = client.db("mediExpress").collection("userReportByNumber");
  reportByNumberCollection.find({"Email":data.Email,"TestType":data.TestType})
  .toArray((err,documents)=>{
    res.send(documents);
  })
})

})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})