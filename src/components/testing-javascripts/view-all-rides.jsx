import { useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import '../stylesheets/UserDashboard.css';
import Web3 from 'web3';
import Dropdown from 'react-bootstrap/Dropdown';
import CommuteIOABI from "../ABI/contracttestingABI.json";
import { FaUser, FaCar, FaHistory, FaEnvelope } from 'react-icons/fa';
import { RiCaravanFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
const contractAddress = '0xf7a418090ece71b8115c1e4f5b47fc18f2972bc7'; 

function ViewAllRides() {
  const history = useHistory();
  const allarray = useSelector((state) => state.allarray);
  
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRideStopsLoading, setIsRideStopsLoading] = useState(true);
  const [sourceValue, setSourceValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [filteredSourceLocations, setFilteredSourceLocations] = useState([]);
  const [filteredDestinationLocations, setFilteredDestinationLocations] = useState([]);
  const [soucedropdownOpen, setSourceDropdownOpen] = useState(false);
  const [destinationdropdownOpen, setDestinationDropdownOpen] = useState(false);
  const [selectedRides, setSelectedRides] = useState([]);
  const [isSelectedRidesLoading, setIsSelectedRidesLoading] = useState(true);
  const [isSearchStarted, setisSearchStarted] = useState(false);
  const [allStopsAvailable, setAllStopsAvailable] = useState([]);
  const [showRideBookedModal, setShowRideBookedModal] = useState(false);
  const dropdownRef = useRef(null);

  const dropdownMenuStyle = {
    position: 'absolute',
    top: "6vh",
    left: '6.90vw',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    borderRadius: '0px 0px 10px 10px',
    padding: '8px',
    zIndex: 1,
    fontSize: 'larger',
    width: "32.90vw",
    height: "19vh",
    overflowY: 'scroll'
  };

  const DestinationdropdownMenuStyle = {
    position: 'absolute',
    top: "6vh",
    left: '43.80vw',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    borderRadius: '0px 0px 10px 10px',
    padding: '8px',
    zIndex: 1,
    fontSize: 'larger',
    width: "32.90vw",
    height: "19vh",
    overflowY: 'scroll'
  };
  
  const handleRideBookedModal = () => {
    setShowRideBookedModal(false);
  };

  const { passengerID } = useParams();

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

          const numRides = await contract.methods.GetnumRides().call();
          let ridesList = [];

          for (let i = 1; i <= numRides; i++) {
            const rideDetails = await contract.methods.GetRideDetails((i)).call();
            ridesList.push({
              RideID: rideDetails[0],
              RideSourceLocation: rideDetails[1],
              RideDestinationLocation: rideDetails[2],
              HostID: rideDetails[3],
              PeersID: rideDetails[4],
              Stops: rideDetails[5],
              RideFare: web3.utils.fromWei(rideDetails[6], 'ether'), // Display in Sepolia ETH
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
          const obj = await contract.methods.getAllStopsAvailable().call();
          const allstopsList = Object.values(obj);
          setAllStopsAvailable(allstopsList);
          setIsRideStopsLoading(false);
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

  const handleSourceInputChange = (event) => {
    const value = event.target.value;
    setSourceValue(value);
    const filtered = allStopsAvailable.filter((location) =>
      location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSourceLocations(filtered);
    setSourceDropdownOpen(true);
  };

  const handleDestinationInputChange = (event) => {
    const value = event.target.value;
    setDestinationValue(value);
    const filtered = allStopsAvailable.filter((location) =>
      location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDestinationLocations(filtered);
    setDestinationDropdownOpen(true);
  };

  const handleSourceLocationSelect = (location) => {
    setSourceValue(location);
    setSourceDropdownOpen(false);
  };

  const handleDestinationLocationSelect = (location) => {
    setDestinationValue(location);
    setDestinationDropdownOpen(false);
  };

  const handleBookRide = async (id) => {
    const ride = rides.find(r => r.RideID === id);
    if (!ride) {
      console.error("Ride not found");
      return;
    }

    const fareInEth = ride.RideFare; // Already in Sepolia ETH
    const fareInWei = web3.utils.toWei(fareInEth, 'ether'); // Convert to Wei for contract

    try {
      const gasAmount = await contract.methods
        .BookARide(passengerID, id, sourceValue, destinationValue)
        .estimateGas({ from: accounts[0], value: fareInWei });

      await contract.methods
        .BookARide(passengerID, id, sourceValue, destinationValue)
        .send({
          from: accounts[0],
          value: fareInWei, // Send exact fare in Wei
          gas: gasAmount
        });

      console.log(`Ride Booked Successfully! ${fareInEth} Sepolia ETH held until leaving`);
      setShowRideBookedModal(true);

      // Update local state to reflect booking
      setSelectedRides(prev =>
        prev.map(r =>
          r.RideID === id
            ? { ...r, PeersID: [...r.PeersID, passengerID], RideSeatsAvailable: r.RideSeatsAvailable - 1 }
            : r
        )
      );
    } catch (error) {
      console.error("Error booking ride:", error);
      alert("Error booking ride: " + error.message);
    }
  };

  const handleLogin = (rideid) => {
    // Store the passengerID in state or local storage
    // Example: setPassengerID(passengerID);
    history.push(`/viewselectedupcomingride/${passengerID}/${rideid}`);

  };
  const handleSearchRides = (event) => {
    event.preventDefault();
    setisSearchStarted(true);
    const filteredRides = rides.filter((ride) => {
      let flag = false;
      if (sourceValue === ride.RideSourceLocation) {
        if (destinationValue === ride.RideDestinationLocation) flag = true;
        else if (ride.Stops.includes(destinationValue)) flag = true;
      } else if (ride.Stops.includes(sourceValue)) {
        if (destinationValue === ride.RideDestinationLocation) flag = true;
        else if (ride.Stops.includes(destinationValue) && (ride.Stops.indexOf(sourceValue) < ride.Stops.indexOf(destinationValue))) flag = true;
      }
      return flag && !ride.isRideStarted && !ride.isRideEnded && ride.RideSeatsAvailable > 0;
    });
    setSelectedRides(filteredRides);
    setIsSelectedRidesLoading(false);
  };

  return (
    <div>
      {!isLoading && (
        <div>
          <div className="MyNavbar">
            <a href='/' style={{border:"none"}}><h3 style={{fontWeight:"700", fontSize:"27px", fontFamily:"Poppins",textAlign:"center", marginTop:"-1vh"}}>CARPOOLING DAPP</h3></a>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/dashboard/${passengerID}`} className="profile">
              <FaUser style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Profile
            </Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}}to={`/myinprogressrides/${passengerID}`} className="CurrentRide">
              <FaCar style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Current Ride
            </Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/ridehistory/${passengerID}`} className="History">
              <FaHistory style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />History
            </Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/enterRideInbox/${passengerID}`} className="Inbox">
              <FaEnvelope style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Inbox
            </Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}}to={`/viewallrides/${passengerID}`} className="CheckRides">
              <FaCar style={{marginRight:"0.5vw", transform:"scale(1.25)"}} />Check Rides
            </Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{color:'#116D6E'}} to={`/startaride/${passengerID}`} className="StartRide">
              <RiCaravanFill style={{marginRight:"0.5vw", transform:"scale(1.25)"}}/>Start A Ride
            </Link></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', marginTop: '13vh' }}>
            <label>
              <h5 style={{ fontWeight: '700', fontSize: 'x-large', color: 'black', marginLeft: '1vw' }}>From: </h5>
            </label>
            <input
              value={sourceValue}
              onChange={handleSourceInputChange}
              placeholder='Enter Source'
              type='text'
              name='sourceLocation'
              style={{ width: '33vw', marginRight: '1vw', marginLeft: '1vw', paddingTop: '0vh', fontSize:"large", paddingLeft:"0.5vw" }}
            />
            <label>
              <h5 style={{ fontWeight: '700', fontSize: 'x-large', color: 'black' }}>To:</h5>
            </label>
            <input
              value={destinationValue}
              onChange={handleDestinationInputChange}
              placeholder='Enter Destination'
              type='text'
              name='destinationLocation'
              style={{ width: '33vw', marginLeft: '0.5vw', paddingTop: '0vh', fontSize:"large", paddingLeft:"0.5vw"}}
            />
            <button
              style={{
                backgroundColor: '#116D6E',
                fontWeight: '700',
                fontSize: 'large',
                color: 'white',
                marginLeft: '1vw',
                marginRight: '-6vw',
                marginTop: '0vh',
                height: '6vh',
                width: '20vw'
              }}
              onClick={handleSearchRides}
            >
              Search Rides
            </button>
            {(filteredSourceLocations.length > 0) && sourceValue.length > 0 && soucedropdownOpen && (
              <div style={dropdownMenuStyle}>
                {filteredSourceLocations.map((location, index) => (
                  <div key={index} style={{borderBottom:"solid 1px black"}}>
                    <button style={{textAlign:"left", marginBottom:"1vh"}} onClick={() => handleSourceLocationSelect(location)}>
                      {location}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {filteredDestinationLocations.length > 0 && destinationValue.length > 0 && destinationdropdownOpen && (
              <div style={DestinationdropdownMenuStyle}>
                {filteredDestinationLocations.map((location, index) => (
                  <div key={index}>
                    <button style={{textAlign:"left", marginBottom:"1vh"}} onClick={() => handleDestinationLocationSelect(location)}>
                      {location}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!(isSelectedRidesLoading) && (
            <div style={{display:"flex", flexDirection:"column", marginLeft:"2vh", marginTop:"5vh", alignSelf:"center", border:"1px solid black", width:"98vw", height:"74vh"}}>
              <div style={{display:"flex", flexDirection:"column", alignSelf:"center", border:'solid 1px black', width:"30vw", backgroundColor:"#FEFEFA", marginTop:"-2vh"}}>
                <h5 style={{fontWeight:"700", color:"black", fontSize:"x-large", textAlign:'center', width:"30vw"}}>Rides Available For Me</h5>
              </div>
              <div>
                <table style={{marginTop:"1vh"}}>
                  <tbody>
                    {selectedRides.map((ride) => (
                      <tr key={ride.RideID}>
                        <td>
                          <div style={{backgroundColor:"#FEFEFA", width:"96vw", marginLeft:"1vw", height:"10vh", marginBottom:"2vh", display:"flex", flexDirection:"row", alignItems:"center"}}>
                            <div style={{display:"flex", flexDirection:"row", paddingLeft:"2vh"}}>
                              <h5 style={{fontWeight:"700", fontSize:"large", color:"black"}}>Ride ID: </h5>
                              <p style={{fontSize:"large", color:"black", paddingLeft:"0.5vh"}}>{ride.RideID}</p>
                            </div>
                            <div style={{width:"8vw", display:"flex", flexDirection:"row", paddingLeft:"5vw"}}>
                              <h5 style={{fontWeight:"700", fontSize:"large", color:"black"}}>Role: </h5>
                              <p style={{fontSize:"large", color:"black", paddingLeft:"0.5vh"}}>{ride.HostID == passengerID ? "Host" : "Passenger"}</p>
                            </div>
                           {/*} <div style={{width:"20vw", display:"flex", flexDirection:"row",paddingLeft:"5vw", marginLeft:"6vw"}}>
                              <h5 style={{fontWeight:"700", fontSize:"large", color:"black"}}>Fare: </h5>
                              <p style={{fontSize:"large", color:"black", paddingLeft:"0.3vh"}}>{ride.RideFare}SepoliaETH</p>
                            </div>*/}
                            <div style={{width:"9vw", display:"flex", flexDirection:"row", paddingLeft:"10vw"}}>
                              <h5 style={{fontWeight:"700", fontSize:"large", color:"black"}}>Fare:</h5>
                              <p style={{fontSize:"large", color:"black", paddingLeft:"0.5vh"}}>{ride.RideFare}SepoliaETH</p>
                            </div>
                            <div style={{width:"20vw", display:"flex", flexDirection:"row", paddingLeft:"5vw", marginLeft:"9vw"}}>
                              <h5 style={{fontWeight:"700", fontSize:"large", color:"black"}}>Ride Status: </h5>
                              <p style={{fontSize:"large", color:"black", paddingLeft:"0.5vh"}}>{(ride.isRideStarted && !ride.isRideEnded) ? "Started" : !(ride.isRideStarted) ? "Not started" : "Ended"}</p>
                            </div>
                            <div style={{display:"flex", flexDirection:"row", marginLeft:"auto", paddingRight:"2vw"}}>
                              {!(ride.HostID == passengerID) && (
                                <button
                                  style={{
                                    backgroundColor: ride.PeersID.includes(passengerID) ? "gray" : "#116D6E",
                                    fontWeight:"700",
                                    fontSize:"large",
                                    color:"white",
                                    height:"6vh",
                                    width:"18vw",
                                    marginRight:"1vw"
                                  }}
                                  onClick={() => handleBookRide(ride.RideID)}
                                  disabled={ride.PeersID.includes(passengerID)}
                                >
                                  {ride.PeersID.includes(passengerID) ? "Booked" : "Book Ride"}
                                </button>
                              )}
                              <button
                                style={{
                                  backgroundColor:"#116D6E",
                                  fontWeight:"700",
                                  fontSize:"large",
                                  color:"white",
                                  height:"6vh",
                                  width:"18vw"
                                }}
                                onClick={() => handleLogin(ride.RideID)}
                                > 
                                View Ride Details
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}    
        </div>
      )}

      {(isLoading || isRideStopsLoading) && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {(isSelectedRidesLoading) && (isSearchStarted) && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {(isRideStopsLoading) && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {!isSearchStarted && (
        <div style={{display:"flex", flexDirection:"column", marginLeft:"2vh", marginTop:"5vh", alignSelf:"center", border:"1px solid black", width:"98vw", height:"74vh"}}>
          <h5 style={{fontSize:"x-large", textAlign:"center", color:"black", marginTop:"30vh"}}>Select your source and destination.</h5>
        </div>
      )}

      <Modal show={showRideBookedModal} onHide={handleRideBookedModal} size="lg" centered>
        <Modal.Header>
          <h4 style={{fontWeight:"700", color:'black'}}>Alert</h4>
        </Modal.Header>
        <Modal.Body style={{textAlign:"center"}}>
          <div style={{alignSelf:"center", textAlign:"center"}}>
            <h4 style={{alignSelf:"center", color:'black', fontWeight:"700", fontSize:"x-large"}}>This Ride has been booked for you!</h4>
            <h4 style={{alignSelf:"center", color:'black', fontSize:"x-large"}}>Check the status of this ride in the <b>Check Rides</b> section</h4>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleRideBookedModal} style={{backgroundColor:"transparent", border:'solid 1px black', paddingLeft:'1vh', paddingRight:'1vh', textAlign:'center'}}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ViewAllRides;