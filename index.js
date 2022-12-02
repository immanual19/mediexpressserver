const express = require('express');
const cors=require('cors');
require('dotenv').config();
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, MongoRuntimeError } = require('mongodb');
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.wo60fyr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
    await client.connect();
    const bookingCollection=client.db('MediExpress').collection('bookingCollection');
    const doctorsCollection=client.db('MediExpress').collection('doctorsCollection');
    const adminsCollection=client.db('MediExpress').collection('adminsCollection');
    const patientsCollection=client.db('MediExpress').collection('patientsCollection');
    const usersCollection=client.db('MediExpress').collection('users');
    const complaintsCollection=client.db('MediExpress').collection('complaints');
    const pastPrescriptionCollection=client.db('MediExpress').collection('pastPrescriptionCollection');
    //update profile starts here
    app.post('/updateprofile',async(req,res)=>{
      const userInfo=req.body;
      
      const query={email:userInfo.email};
      const exists=await usersCollection.findOne(query);
      if(exists){
        return res.send({success: false, userInfo:exists});
      }
      const result=await usersCollection.insertOne(userInfo);
      return res.send({success:true,result});
    });
    //update profile ends here

    //get profile info
    app.post('/userinfo',async(req,res)=>{
      
      const query={email:req.body.email};
      const data=await usersCollection.findOne(query);
      if(data){
        res.send(data);
      }
      
    });
    //get profile info

    //Posting Doctors Profile
    app.post('/updatedoctors',async(req,res)=>{
      const info=req.body;
      const result=await doctorsCollection.insertOne(info);
      return res.send({success:true,result});
    });
    //Posting Doctors Profile

    //Posting Admin Profile
    app.post('/updateadmins',async(req,res)=>{
      const info=req.body;
      const result=await adminsCollection.insertOne(info);
      return res.send({success:true,result});
    });
    //Posting Admin Profile

    //Posting Patient's profile

    app.post('/updatepatients',async(req,res)=>{
      const info=req.body;
      const result=await patientsCollection.insertOne(info);
      return res.send({success:true,result});
    })

    //Posting Patient's profile


    app.post('/doctors',async(req,res)=>{
     
      const query={speciality:req.body.speciality};
      const cursor=doctorsCollection.find(query);
      const doctors=await cursor.toArray();
      res.send(doctors);
    });
    app.post('/booking',async(req,res)=>{
      const booking=req.body;
      const query={patientName:booking.patientName, doctorId:booking.doctorId, date:booking.date};
      const exists=await bookingCollection.findOne(query);
      if(exists){
        return res.send({success: false, booking:exists});
      }
      const result=await bookingCollection.insertOne(booking);
      return res.send({success:true, result});
    });

    //posting complaints

    app.post('/complaint',async(req,res)=>{
      const complaint=req.body;
      const result=await complaintsCollection.insertOne(complaint);
      return res.send({success:true,result});
    });

    //posting complaints
    
    //storing past medical history
    app.post('/pastmedicalhistory',async(req,res)=>{
      const info=req.body;
      const result=await pastPrescriptionCollection.insertOne(info);
      return res.send({success:true,result});
    })
    //storing past medical history

    //fetching doctor image
    app.post('/doctorinfo',async(req,res)=>{
      const query={email:req.body.email};
      const data=await doctorsCollection.findOne(query);
      if(data){
        return res.send({success:true,data});
      }
      return res.send({success:false});
    });
    //fetching doctor image


    //fetching patient image
    app.post('/patientinfo',async(req,res)=>{
      const query={email:req.body.email};
      const data=await patientsCollection.findOne(query);
      if(data){
        return res.send({success:true,data});
      }
      return res.send({success:false});
    });
    //fetching patient image

    //fetching admin image
    app.post('/admininfo',async(req,res)=>{
      const query={email:req.body.email};
      const data=await adminsCollection.findOne(query);
     
      if(data){
        return res.send({success:true,data});
      }
      return res.send({success:false});
    });
    //fetching admin image

    //adjusting available slots

    app.post('/updatedata',async(req,res)=>{
      const query={_id:req.body.doctorId};
      const result=await doctorsCollection.findOne(query);
      let targettedSlot;
      let prevSlots;
      for(let i=0;i<result.schedules.length;++i){
        if(result.schedules[i].day==req.body.date){
          prevSlots=result.schedules[i].slots;
          targettedSlot=i;
          break;
        }
      }
      prevSlots=prevSlots-1;
      result.schedules[targettedSlot].slots=String(prevSlots);
      
     const response=await doctorsCollection.updateOne({_id:req.body.doctorId},{
        $set:{
          schedules:result.schedules
        }
      })
      return res.send({success:true,response})
    });

    //adjusting available slots

    }
    finally{

    }

}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello from MediExpress!')
})

app.listen(port, () => {
  console.log(`MediExpress listening on port ${port}`)
})

module.exports = app;