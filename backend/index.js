const express=require('express');
const cors=require('cors');

const app=express();

app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    res.send('Inkloom AI backend is running ');
});


app.get('/api/health',(req,res)=>{
    res.json({
        success:true,
        message:'Inkloom AI API is working!'
    });
});


app.post("/api/check", (req, res) => {
  const {content,guidelines} = req.body;
  console.log("Received content:", content);
  console.log("Received guidelines:", guidelines);
  res.json({
    success: true,
    receivedContent: content,
    receivedGuidelines: guidelines
  });
});





app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});