import io from "socket.io-client";
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { FaUser, FaListAlt, FaCar, FaHistory, FaEnvelope } from 'react-icons/fa';
import { RiCaravanFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Chat from './Chat';
import Web3 from 'web3';
import CommuteIOABI from '../ABI/contracttestingABI.json';

const socket = io.connect("http://localhost:4000");

const contractAddress = '0xf7a418090ece71b8115c1e4f5b47fc18f2972bc7';

function Inbox() {
  const { passengerID } = useParams();
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);

          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);

          const contract = new web3.eth.Contract(CommuteIOABI, contractAddress);
          setContract(contract);
        } catch (error) {
          console.error('Error initializing Web3:', error);
          alert('An error occurred while initializing Web3. Please make sure you have MetaMask installed and try again.');
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initialize();
  }, []);

  const joinRoom = async () => {
    if (username !== "" && room !== "") {
      console.log(passengerID);
      const rideDetails = await contract.methods.GetRideDetails(room).call();
      if (rideDetails[3] == passengerID || rideDetails[4].includes(passengerID)) {
        socket.emit("join_room", room);
        setShowChat(true);
      } else {
        alert("Incorrect RideID");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        className="MyNavbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ccc',
        }}
      >
        <a href='/' style={{ border: "none", textDecoration: 'none' }}>
          <h3 style={{ fontWeight: "700", fontSize: "xx-large", fontFamily: "Poppins", marginTop: "-1vh" }}>CARPOOLING DAPP</h3>
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/dashboard/${passengerID}`}
              className="profile"
            >
              <FaUser style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Profile
            </Link>
          </button>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/myinprogressrides/${passengerID}`}
              className="CurrentRide"
            >
              <FaCar style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Current Ride
            </Link>
          </button>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/ridehistory/${passengerID}`}
              className="History"
            >
              <FaHistory style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />History
            </Link>
          </button>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/enterRideInbox/${passengerID}`}
              className="Inbox"
            >
              <FaEnvelope style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Inbox
            </Link>
          </button>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/viewallrides/${passengerID}`}
              className="CheckRides"
            >
              <FaCar style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Check Rides
            </Link>
          </button>
          <button
            className='i-know-this-class-of-buttons-doesnt-exist'
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <Link
              style={{ color: '#116D6E', textDecoration: 'none' }}
              to={`/startaride/${passengerID}`}
              className="StartRide"
            >
              <RiCaravanFill style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Start A Ride
            </Link>
          </button>
        </div>
      </div>

      <div
        className="ChatApp"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f1f1f1',
        }}
      >
        {!showChat ? (
          <div
            className='joinChatContainer'
            style={{
              alignSelf: 'center',
              textAlign: 'center',
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ color: "black", fontWeight: "700", paddingBottom: "20px" }}>Join RideChat</h3>
            <input
              type="text"
              style={{ width: "220px", margin: "10px", padding: "8px", border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Username"
              onChange={(e) => { setUsername(e.target.value) }}
            />
            <input
              type="text"
              style={{ width: "220px", margin: "10px", padding: "8px", border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="RideID"
              onChange={(e) => { setRoom(e.target.value) }}
            />
            <button
              className="Joinbutton"
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: '#116D6E',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={joinRoom}
            >
              Enter Ride Inbox
            </button>
          </div>
        ) : (
          <Chat socket={socket} username={username} room={room} />
        )}
      </div>
    </div>
  );
}

export default Inbox;