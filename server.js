const express=require("express");
const app=express();
const http=require("http");
const {Server}=require("socket.io");
const {UserData}=require("./userData")
const moment=require("moment");

const server=http.createServer(app);

server.listen(4100,()=>{
    console.log("connected to server at 4100");
})

app.get("/",(req,res)=>{
    res.send("<h1>Chit Chat Application</h1>");
})

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"./chatRoom.html");
})

/*---------------------------------- server ----------------------------------*/

const wss=new Server(server);

let Usercount=0;

wss.on("connection",(socket)=>{
    Usercount++;

    console.log("A new User connected");


    socket.on("userInfo",(data)=>{
        data.id=socket.id;        
        socket.join(data.roomId);
        if(data.userName){
            UserData.push(data);
            socket.emit("welcome",`Welcome to chat ${data.userName}`);
            socket.broadcast.to(data.roomId).emit("welcome",`${data.userName} has joined the chat`);
        }

    })


    socket.on("message",(data)=>{
        let i=0;
        while(true){
            if(UserData[i].id===socket.id){
                let room=UserData[i].roomId;
                let name=UserData[i].userName
                let time=moment().format('h:mm a');
                wss.to(room).emit("message",{name,data,time})
                break;
            }
            i++;
        }
    })


    socket.on("disconnect",()=>{
        Usercount--;
        console.log("User left");
            let i=0;
            while(true){
                if(UserData[i].id===socket.id){
                    let room=UserData[i].roomId;
                    let name=UserData[i].userName;
                    let data='has left the chat ';
                    let time=moment().format('h:mm a');
                    wss.to(room).emit("userLeft",{name,data,time})
                    break;
                }
                i++;
            }
        })
})