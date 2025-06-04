import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import '../stylesheets/UserDashboard.css';
import Web3 from 'web3';
import CommuteIOABI from "../ABI/contracttestingABI.json";
import { FaUser, FaCar, FaHistory, FaEnvelope } from 'react-icons/fa';
import { RiCaravanFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
const contractAddress = '0xf7a418090ece71b8115c1e4f5b47fc18f2972bc7';

function CurrentRide() {
  const { passengerID } = useParams();
  const history = useHistory();

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [passengerRequests, setPassengerRequests] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [rides, setRides] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isHandlingEvent = false;

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

          const numPassengers = await contract.methods.GetnumPassengers().call();
          let passengersList = [];
      
          for (let i = 0; i < numPassengers; i++) {
            const passengerDetails = await contract.methods.GetPassDetails((i+1)).call();
            passengersList.push({
              PassID: passengerDetails[0],
              PassName: passengerDetails[1],
              PassWalletAddress: passengerDetails[2],
              PassHomeAddress: passengerDetails[3],
              PassEMail: passengerDetails[9],
              PassVehicleName: passengerDetails[10],
              PassVehicleNumber: passengerDetails[11],
              PassVehicleDetailsHash: passengerDetails[4],
              PassGender: passengerDetails[5],
              PassReview: passengerDetails[6],
              PassRidesHosted: passengerDetails[7],
              PassRidesTaken: passengerDetails[8],
            });
          }
      
          setPassengers(passengersList);

          const numRides = await contract.methods.GetnumRides().call();
          let ridesList = [];

          for (let i = 1; i <= numRides; i++) {
            const rideDetails = await contract.methods.GetRideDetails(i).call();
            ridesList.push({
              RideID: rideDetails[0],
              RideSourceLocation: rideDetails[1],
              RideDestinationLocation: rideDetails[2],
              HostID: rideDetails[3],
              PeersID: rideDetails[4],
              Stops: rideDetails[5],
              RideFare: rideDetails[6],
              RideSeatsAvailable: rideDetails[7],
              RideUpdates: rideDetails[8],
              RideDateandTime: rideDetails[9],
              isRideStarted: rideDetails[10],
              isRideEnded: rideDetails[11],
              rideStartTime: rideDetails[12],
              rideEndTime: rideDetails[13]
            });
          }

          setRides(ridesList);
          setIsLoading(false);

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

  const handleLogin = (rideid) => {
    history.push(`/viewselectedupcomingride/${passengerID}/${rideid}`);
  };

  const handleCancelRide = async (rideId, role) => {
    try {
      if (role === "Host") {
        await contract.methods.CancelRideAsHost(rideId).send({ from: accounts[0] });
        alert("Ride cancelled successfully!");
      } else {
        await contract.methods.CancelRideAsPassenger(rideId, passengerID).send({ from: accounts[0] });
        alert("Ride booking cancelled successfully! Your fare has been refunded.");
      }
      
      // Refresh rides list
      const numRides = await contract.methods.GetnumRides().call();
      let ridesList = [];

      for (let i = 1; i <= numRides; i++) {
        const rideDetails = await contract.methods.GetRideDetails(i).call();
        ridesList.push({
          RideID: rideDetails[0],
          RideSourceLocation: rideDetails[1],
          RideDestinationLocation: rideDetails[2],
          HostID: rideDetails[3],
          PeersID: rideDetails[4],
          Stops: rideDetails[5],
          RideFare: rideDetails[6],
          RideSeatsAvailable: rideDetails[7],
          RideUpdates: rideDetails[8],
          RideDateandTime: rideDetails[9],
          isRideStarted: rideDetails[10],
          isRideEnded: rideDetails[11],
          rideStartTime: rideDetails[12],
          rideEndTime: rideDetails[13]
        });
      }
      setRides(ridesList);

    } catch (error) {
      console.error('Error cancelling ride:', error);
      alert("Error cancelling ride: " + error.message);
    }
  };

  const handleTesting = () => {
    const rideid = 2;
    console.log(typeof(rides[rideid-1].isRideStarted), rides[rideid-1].isRideStarted);
  };

  return (
    <div>{!isLoading && ( 
    <div>
      <div className="MyNavbar">
        <a href='/' style={{border:"none"}}><h3 style={{fontWeight:"700", fontSize:"27px", fontFamily:"Poppins",textAlign:"center", marginTop:"-1vh"}}>CARPOOLING DAPP</h3></a>
        <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/dashboard/${passengerID}`} className="profile">
          <FaUser style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Profile
        </Link></button>
        <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}}to={`/myinprogressrides/${passengerID}`} className="CurrentRide">
          <FaCar style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Current Rides
        </Link></button>
        <button className='i-know-this-class-of-buttons-doesnt-exist' ><Link style={{color:'#116D6E'}} to={`/ridehistory/${passengerID}`} className="History">
          <FaHistory style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />History
        </Link></button>
        <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/enterRideInbox/${passengerID}`} className="Inbox">
          <FaEnvelope style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Inbox
        </Link></button>
        <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}}to={`/viewallrides/${passengerID}`} className="CheckRides">
          <FaCar style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Check Ride
        </Link></button>
        <button className='i-know-this-class-of-buttons-doesnt-exist' ><Link style={{color:'#116D6E'}} to={`/startaride/${passengerID}`} className="StartRide">
          <RiCaravanFill style={{marginRight:"0.5vw", transform:"scale(1.25)"}}/>Start A Ride
        </Link></button>
      </div>

      <div style={{display:"flex",flexDirection:"column",marginLeft:"2vh",marginTop:"13vh", alignSelf:"center", border:"1px solid black", width:"98vw", height:"84vh"}}>
        <div style={{display:"flex",flexDirection:"column",alignSelf:"center", border:'solid 1px black',width:"30vw",backgroundColor:"#FEFEFA",marginTop:"-2vh"}}>
          <h5 style={{fontWeight:"700", color:"black", fontSize:"x-large",textAlign:'center',width:"30vw"}}>My Current Ride in Progress</h5>
        </div>
        <div>
          <table style={{marginTop:"1vh"}}>
            <tbody>
            {rides.length > 0 && rides.map((ride) => (
              <div key={ride.RideID}>
                {((ride.HostID === passengerID || ride.PeersID.includes(passengerID)) && !(ride.isRideEnded)) && (
                  <tr>
                    <td>
                      <div style={{ backgroundColor: "#FEFEFA", width: "96vw", marginLeft: "1vw", height: "8vh", marginBottom: "2vh", display: "flex", flexDirection: "row" }}>
                        <div style={{ display: "flex", flexDirection: "row", marginTop: "2vh", paddingLeft: "2vh" }}>
                          <h5 style={{ fontWeight: "700", fontSize: "large", color: "black" }}>Ride ID: </h5>
                          <p style={{ fontSize: "large", color: "black", paddingLeft: "0.5vh" }}>{ride.RideID}</p>
                        </div>
                        <div style={{ width: "8vw", display: "flex", flexDirection: "row", marginTop: "2vh", paddingLeft: "10vw" }}>
                          <h5 style={{ fontWeight: "700", fontSize: "large", color: "black" }}>Role: </h5>
                          <p style={{ fontSize: "large", color: "black", paddingLeft: "0.5vh" }}>{ride.HostID === passengerID ? "Host" : "Passenger"}</p>
                        </div>
                        <div style={{ width: "40vw", display: "flex", flexDirection: "row", marginTop: "2vh", marginLeft: "8vw" }}>
                          <h5 style={{ fontWeight: "700", fontSize: "large", color: "black", marginLeft: "10vw" }}>Ride Status: </h5>
                          <p style={{ fontSize: "large", color: "black", paddingLeft: "0.5vh" }}>{ride.isRideStarted ? "Started" : "Not started"}</p>
                        </div>
                        <div style={{ width: "40vw", display: "flex", flexDirection: "row", marginTop: "2vh", marginLeft: "-10vw" }}>
                          <button
                            style={{ backgroundColor: "#116D6E", fontWeight: "700", fontSize: "large", color: "white", marginLeft: "15vw", marginRight: "1vw", marginTop: "-1vh", height: "6vh", width: "18vw" }}
                            onClick={() => handleLogin(ride.RideID)}
                          >
                            View Ride Details
                          </button>
                          <button
                            style={{ 
                              backgroundColor: ride.isRideStarted ? "#cccccc" : "#ff4444", 
                              fontWeight: "700", 
                              fontSize: "large", 
                              color: "white", 
                              marginTop: "-1vh", 
                              height: "6vh", 
                              width: "18vw",
                              cursor: ride.isRideStarted ? "not-allowed" : "pointer"
                            }}
                            onClick={() => handleCancelRide(ride.RideID, ride.HostID === passengerID ? "Host" : "Passenger")}
                            disabled={ride.isRideStarted}
                          >
                            Cancel Ride
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </div>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    )}
    
    {isLoading && (<div className="loading-spinner">
      <div className="spinner"></div>
    </div>)}
    
    </div>
  );
}

export default CurrentRide;