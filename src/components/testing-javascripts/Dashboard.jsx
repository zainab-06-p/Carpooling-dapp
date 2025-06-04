import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../stylesheets/UserDashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from 'web3';
import CommuteIOABI from "../ABI/contracttestingABI.json";
import { FaStar } from 'react-icons/fa';
import { FaUser, FaListAlt, FaCar, FaHistory, FaEnvelope } from 'react-icons/fa';
import { RiCaravanFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Toast from 'react-bootstrap/Toast';

const contractAddress = '0xf7a418090ece71b8115c1e4f5b47fc18f2972bc7';

function DashboardPage() {
  const { passengerID } = useParams();
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationDate, setRegistrationDate] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [previousRides, setPreviousRides] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [prevDates, setPrevDates] = useState([]);
  const windowHeight = window.innerHeight;
  const avatarSize = windowHeight * 0.3;

  const handleClick = (index) => {
    setShowToast(true);
  };

  const handleCloseToast = () => setShowToast(false);

  function formatDate(date) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

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
            const passengerDetails = await contract.methods.GetPassDetails((i + 1)).call();
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

          const requestDetails = await contract.methods.GetPassRequestDetails(parseInt(passengerID)).call();
          setUserDetails(requestDetails);

          const dt = await contract.methods.GetPassDateJoined(passengerID).call();
          const parsedDate = new Date(dt);
          const formattedDate = formatDate(parsedDate);
          setRegistrationDate(formattedDate);

          const cid = await contract.methods.getProfilePicture(passengerID).call();
          if (cid && cid !== "") {
            setImageSrc(`https://ipfs.io/ipfs/${cid}`);
          }

          const today = new Date();
          let dates = [formatDate(today)];
          for (let i = 1; i <= 6; i++) {
            const previousDate = new Date(today);
            previousDate.setDate(today.getDate() - i);
            dates.push(formatDate(previousDate));
          }
          setPrevDates(dates);

          let prevRides = [];
          const numRides = await contract.methods.GetnumRides().call();
          for (let i = 1; i <= numRides; i++) {
            const ride = await contract.methods.GetRideDetails(i).call();
            if ((ride[3] == passengerID || ride[4].includes(passengerID)) && dates.includes(ride[9][0])) {
              const details = [ride[9][0], ride[1], ride[2]];
              prevRides.push(details);
            }
          }
          setPreviousRides(prevRides);

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

  return (
    <div>
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="MyNavbar">
            <a href='/' style={{ border: "none" }}><h3 style={{ fontWeight: "700", textAlign: "center", fontSize: "30px", fontFamily: "Poppins", marginLeft: "0.8vh", marginTop: "-1vh" }}>CARPOOLING DAPP</h3></a>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/dashboard/${passengerID}`} className="profile"><FaUser style={{ marginRight: "0.5vw", transform: "scale(1.27)" }} />Profile</Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/myinprogressrides/${passengerID}`} className="CurrentRide"><FaCar style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Current Ride</Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/ridehistory/${passengerID}`} className="History"><FaHistory style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />History</Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/enterRideInbox/${passengerID}`} className="Inbox"><FaEnvelope style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Inbox</Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/viewallrides/${passengerID}`} className="CheckRides"><FaCar style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Check Rides</Link></button>
            <button className='i-know-this-class-of-buttons-doesnt-exist'><Link style={{ color: '#116D6E' }} to={`/startaride/${passengerID}`} className="StartRide"><RiCaravanFill style={{ marginRight: "0.5vw", transform: "scale(1.25)" }} />Start A Ride</Link></button>
          </div>
          <div className="heading" style={{ alignSelf: 'center' }}><h2 style={{ fontWeight: "700", fontSize: "xx-large", color: "black" }}>Welcome aboard, User!</h2></div>
          <div className="AllinAll" style={{ alignSelf: "center" }}>
            <div className="profilesec" style={{ display: 'flex', flexDirection: "row", alignSelf: 'center' }}>
              
              <div style={{ width: "55%", height: "80%" }}>
                <div className="UserDetails">
                  <div style={{ fontSize: "45px",textAlign:"center", fontWeight: "bold",paddingLeft:"70%" ,paddingBottom: "2.5vw" }}>{passengers[passengerID - 1]?.PassName || " "}</div>
                  <div style={{  fontSize:"23px",marginTop: "-5vh", marginBottom: "0.5vw" }}><b>Email-ID:</b> <u>{passengers[passengerID - 1]?.PassEMail || " "}</u></div>
                  <div style={{ fontSize:"23px",marginBottom: "0.5vw" }}><b>Community Review:</b> {passengers[passengerID - 1]?.PassReview || " "}<FaStar /></div>
                  <div style={{ fontSize:"23px", marginBottom: "0.5vw" }}><b>Date Joined:</b> {registrationDate || " "}</div>
                  <div style={{  fontSize:"23px",marginBottom: "0.5vw" }}><b>Rides Hosted:</b> {passengers[passengerID - 1]?.PassRidesHosted || " "}</div>
                  <div style={{  fontSize:"23px",marginBottom: "0.5vw" }}><b>Rides Taken:</b> {passengers[passengerID - 1]?.PassRidesTaken || " "}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: "column" }}>
              <div className="walletwagera">
                <div style={{ marginTop: "1vw" }}><b>Location:</b> {passengers[passengerID - 1]?.PassHomeAddress || " "}</div>
                <div><b>Metamask Wallet Address:</b> {passengers[passengerID - 1]?.PassWalletAddress || " "}</div>
                <div><b>Registered Vehicle:</b> {passengers[passengerID - 1]?.PassVehicleName === " " ? "N/A" : `${passengers[passengerID - 1]?.PassVehicleName}, ${passengers[passengerID - 1]?.PassVehicleNumber}`}</div>
              </div>
              <div className="RewardReferral">
                <div style={{ marginTop: "0.75vw" }}><b>CARPOOLING DAPP Passenger ID:</b> {passengerID}</div>
                <div><b>Reward Points:</b> 0</div>
                <div><b>Referral Link:</b> Coming Soon...</div>
              </div>
            </div>
          </div>
          <div className="importantbaat" style={{ alignSelf: "center", display: 'flex', flexDirection: 'column', marginTop: "-3vh" }}>
            <div className="greenbox" style={{ display: 'flex', flexDirection: 'column', height: '25vh' }}>
              <h4 style={{ color: 'white', fontWeight: '700', marginLeft: "1vw", marginTop: '2vh' }}>{passengers[passengerID - 1]?.PassName.split(" ")[0]}'s Past Week:</h4>
              <div style={{ display: 'flex', flexDirection: "row", justifyContent: 'space-between', paddingLeft: '12vw', paddingRight: '12vw' }}>
                {prevDates.length > 0 && [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - dayIndex));
                  const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const dateNumber = date.getDate();
                  const currentToastDate = prevDates[6 - dayIndex];
                  let associatedRides = [];
                  if (previousRides.length > 0) {
                    associatedRides = previousRides.filter(ride => ride[0] === currentToastDate);
                  }

                  return (
                    <div
                      style={{ textAlign: 'center', backgroundColor: "#FFFFFF", color: "#1B9C85", paddingBottom: "1vh", paddingLeft: '1vh', paddingRight: '1vh', marginLeft: "0.5vw", height: "15vh", width: '7vw', borderRadius: "5px", display: 'flex', flexDirection: "column" }}
                      onMouseEnter={() => setShowToast(dayIndex)}
                      onMouseLeave={() => setShowToast(null)}
                      key={dayIndex}
                    >
                      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{day}</div>
                      <div style={{ fontSize: "30px", fontWeight: "bold" }}>{dateNumber}</div>
                      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{month}</div>
                      {showToast === dayIndex && (
                        <div style={{ width: "60vw", marginLeft: "-4vw" }}>
                          <Toast onClose={() => setShowToast(null)} style={{ marginTop: "-40vh" }}>
                            <Toast.Header>
                              <strong className="me-auto">Ride Details</strong>
                              <small>{day}, {month} {dateNumber}</small>
                            </Toast.Header>
                            <Toast.Body style={{ color: 'black', textAlign: "left", zIndex: '10' }}>
                              <div>
                                {associatedRides.length > 0 && associatedRides.map((ride, index) => (
                                  <div key={index} style={{ fontSize: "larger" }}>
                                    <u>Ride {index + 1}:</u><br />
                                    From: <p style={{ fontWeight: "400" }}>{ride[1]}</p>
                                    To: <p style={{ fontWeight: "400" }}>{ride[2]}</p>
                                    <hr />
                                  </div>
                                ))}
                                {associatedRides.length === 0 && (
                                  <div style={{ fontSize: "larger", fontWeight: "400", paddingTop: '2.5vh', paddingBottom: "2.5vh", textAlign: 'center' }}>No Rides were scheduled for this day.</div>
                                )}
                              </div>
                            </Toast.Body>
                          </Toast>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoading && (<div className="loading-spinner"><div className="spinner"></div></div>)}
    </div>
  );
}

export default DashboardPage;