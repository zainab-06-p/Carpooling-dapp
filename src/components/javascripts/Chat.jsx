import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import io from 'socket.io-client';
import ScrollToBottom from 'react-scroll-to-bottom';
import {FaPaperPlane,FaSearch,FaUserFriends,FaUserCircle} from 'react-icons/fa'
import {BsChatDotsFill} from 'react-icons/bs';


const socket = io('http://localhost:4000');



function Chat({socket,username,room}) {
  const [currentMessage,setCurrentMessage]=useState("");
  const [messageList,setMessageList] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([username]);
  

  const sendMessage = async () =>{
    if (currentMessage !== ""){
      const messageData = {
        room : room,
        author: username,
        message: currentMessage,
        time : new Date(Date.now()).getHours()+":"+ new Date(Date.now()).getMinutes(),
        
      };

      await axios.post('http://localhost:4000/messages', messageData);

      await new Promise((resolve) => {
      socket.emit("send_message", messageData, resolve);
      // console.log("message sent event ")
      setCurrentMessage("");
    })
      

    }
  }

  // const sound = useMemo(()=> new Audio('./notifications.mp3'),[])

  const receiveMessageHandler = (data) => {
    setMessageList((prevList) => [...prevList, data]);
    // sound.play()
    console.log('event receive message init');
  };

  

  useEffect(()=>{
    
    axios.get(`http://localhost:4000/messages/${room}`)
      .then((response) => {
        setMessageList(response.data);
      })
      .catch((error) => {
        console.error('Error retrieving chat history:', error);
      });

    socket.on("receive_message",receiveMessageHandler)

    socket.on('user_entered', (data) => {
      setUsersInRoom((users) => {
        if (!users.includes(data)) {
          return [...users, data];
          
        }
        return users;
        
      });
    });

    socket.on('users_in_room', (users) => {
      setUsersInRoom(users);
    });

    socket.emit('join_room', { room, username });
    
     
    return () => {
      socket.off('receive_message',receiveMessageHandler);
      socket.off("user_entered");
    };  

    },[room,username]);

  return (
    <div style={{display:'flex',flexDirection:'row'}}>
        <div style={{height:"85vh",width:"40vw"}}>
        <div className="friendlist" style={{marginTop:'2vh',paddingBottom:'2vh',marginLeft:'2vh'}} >
        <div style={{ position: "relative" }}>
 {/*} <input
    type='text'
    placeholder='Search for fellow Peers on Ride'
    style={{
      marginLeft: "17px",
      height: "40px",
      width: "35vw",
      padding: "10px",
     paddingLeft: "40px",
      fontSize: "20px",
      marginTop: '2vh'
    }}
  />*/}
  {/*<span
    style={{
      position: "absolute",
      top: "50%",
      left: "2vw",
      transform: "translateY(-50%)",
      color: "#999",
      fontSize: "20px"
    }}
  >
    <FaSearch />
  </span>*/}
</div>

      <div className='friendlist-names' style={{overflowY:"scroll",height:'60vh'}}>
      {usersInRoom.map((user, index) => (
              <div key={index} className={username === user ? 'G2 currentUser' : 'G2'}>
                <FaUserCircle style={{fontSize:"40px", marginRight:"10px"}}/>{user}
                
              </div>    
            ))}            
      </div>
      <div>
      {usersInRoom.length > 1 && (
                <div className='G2'>
                  {`${usersInRoom.length - 1} Other User${usersInRoom.length-1 > 1 ? 's' : ''} online`}
                  
                </div> 
               )}

      </div>
      </div></div>

      {/* Right Section - Chat Window */}
      <div style={{ width: '58vw', marginLeft: '2vw', border: '1px solid green' }}>
        <div style={{ height: '85vh' }}>
          <div style={{ backgroundColor: '#116D6E', color: 'white', padding: '10px' }}>
            <BsChatDotsFill style={{ fontSize: '30px', marginRight: '10px' }} />Live Chat
          </div>
          <div style={{ height: '70vh', backgroundColor: '#d3d3d3', overflowY: 'auto' }}>
            {messageList.length === 0 ? (
              <p style={{ padding: '10px' }}>No messages yet</p>
            ) : (
              messageList.map((messageContent, index) => (
                <div key={index} style={{ padding: '10px', textAlign: username === messageContent.author ? 'right' : 'left' }}>
                  <div style={{ backgroundColor: '#e0e0e0', display: 'inline-block', padding: '5px 10px', borderRadius: '5px' }}>
                    <p>{messageContent.message}</p>
                  </div>
                  <div>
                    <span>{messageContent.time}</span> <span>{messageContent.author}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', padding: '10px' }}>
            <input
              type="text"
              value={currentMessage}
              placeholder='Type your message'
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, padding: '5px' }}
            />
            <button onClick={sendMessage} style={{ marginLeft: '10px' }}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;