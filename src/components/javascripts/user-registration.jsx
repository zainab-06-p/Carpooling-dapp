import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CommuteIOABI from '../ABI/contracttestingABI.json';
import "../stylesheets/administrator-dashboard-requests.css";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CgProfile } from "react-icons/cg"; 
import { GiCartwheel } from "react-icons/gi";
import { IoShieldHalf } from "react-icons/io5";
import Carousel from 'react-bootstrap/Carousel';
import { useHistory } from 'react-router-dom';
import imageh from "./image-removebg-preview (14).png";

const contractAddress = '0xf7a418090ece71b8115c1e4f5b47fc18f2972bc7';

function AdministratorDashboardUserRegistration() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [passengerRequests, setPassengerRequests] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [name, setName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [email, setEMail] = useState("");
  const [vehicleName, setVehicleName] = useState(" ");
  const [vehicleNumber, setVehicleNumber] = useState(" ");
  const [gender, setGender] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isChoosingVehicle, setIsChoosingVehicle] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRequestMadeModal, setShowRequestMadeModal] = useState(false);
  const [showDuplicateEntriesModal, setShowDuplicateEntriesModal] = useState(false);
  const [showRegistrationCompletionModal, setShowRegistrationCompletionModal] = useState(false);
  const [flag, setFlag] = useState(true);
  const [index, setIndex] = useState(0);
  const history = useHistory();

  const handleSelect = (selectedIndex) => setIndex(selectedIndex);
  const handleNavigationClick = (selectedIndex) => setIndex(selectedIndex);
  const handleSkipClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleCloseRequestMadeModal = () => setShowRequestMadeModal(false);
  const handleDuplicateEntriesModal = () => setShowDuplicateEntriesModal(false);
  const handleCheckboxChange = (event) => setIsChecked(event.target.checked);

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
          await loadPassengerRequests(contract);
          await loadPassengers(contract);
          contract.events.PassengerRequestCreated()
            .on('data', handlePassengerRequestCreated)
            .on('error', (error) => console.error('Error listening to PassengerRequestCreated event:', error));
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

  const loadPassengerRequests = async (contract) => {
    const numPassRequests = await contract.methods.GetnumPassRequests().call();
    let passengerRequests = [];
    for (let i = 1; i <= numPassRequests; i++) {
      const requestDetails = await contract.methods.GetPassRequestDetails(i).call();
      passengerRequests.push({
        PassRequestID: requestDetails[0],
        PassName: requestDetails[1],
        PassWalletAddress: requestDetails[2],
        PassHomeAddress: requestDetails[3],
        PassEMail: requestDetails[7],
        PassVehicleName: requestDetails[8],
        PassVehicleNumber: requestDetails[9],
        PassVehicleDetailsHash: requestDetails[4],
        PassGender: requestDetails[5],
        PassRequestStatus: requestDetails[6],
      });
    }
    setPassengerRequests(passengerRequests);
  };

  const loadPassengers = async (contract) => {
    const numPassengers = await contract.methods.GetnumPassengers().call();
    const passengersList = [];
    for (let i = 1; i <= numPassengers; i++) {
      const passengerDetails = await contract.methods.GetPassDetails(i).call();
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
  };

  const walletAddressVerification = () => {
    return !passengerRequests.some(request => request.PassWalletAddress === accounts[0]);
  };

  const emailVerification = () => {
    return !passengerRequests.some(request => request.PassEMail === email);
  };

  const handleNameUpdate = async () => {
    setName(firstName + " " + lastName);
  };

  const handleRegistrationModal = async () => {
    setShowRegistrationCompletionModal(false);
    history.push(`/verification-portal`);
  };

  function handlePassengerRequestCreated(event) {
    const requestId = event.returnValues.ID;
    // Handle event logic if needed
  }

  const createPassengerRequest = async () => {
    try {
      await handleNameUpdate();
      await contract.methods
        .CreatePassengerRequest(name, homeAddress, " ", gender, email, vehicleName, vehicleNumber) // No vehicleDetailsHash
        .send({ from: accounts[0] });
      await loadPassengerRequests(contract);
      setShowRequestMadeModal(true);
      if (flag) setShowRegistrationCompletionModal(true);
    } catch (error) {
      console.error('Error creating passenger request:', error);
      if (error.code === 4001) {
        alert('Transaction was denied by the user.');
        setFlag(false);
        window.location.reload();
      } else {
        alert('An error occurred while creating the passenger request. Please try again.');
      }
    }
  };

  return (
    <div className='administrator-dashboard-requests-container' style={{ backgroundColor: "#F1EEE5", marginTop: "1vh", marginLeft: "1vw", width: "98vw", height: "98vh", display: "flex", flexDirection: "column", border: "solid 1px black", borderRadius: "20px" }}>
      <div className='administrator-dashboard-requests-navbar' style={{ backgroundColor: "#FFFFFF", width: "97.75vw", height: "10vh", display: "flex", flexDirection: "row", textAlign: "center", borderRadius: "20px 20px 0px 0px", paddingLeft: "1vh", paddingTop: "1vh" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "row" }}>
          <li style={{ marginTop: "1vh" }}>
            <button style={{ backgroundColor: "transparent", color: "black", fontWeight: "700", fontSize: "40px", marginTop: "-1vh", paddingRight: "10vw", marginBottom: "5vh", height: "5vh" }}>
              <a href='/' style={{ border: "none", color: "black" }}>CARPOOLING DAPP</a>
            </button>
          </li>
        </ul>
      </div>
      <br />
      <h2 style={{ fontWeight: "700", fontSize: "xx-large", textAlign: 'center', color: 'black', marginTop: "-4vh" }}>SIGN UP TO USE CARPOOLING DAPP</h2>
      <h5 style={{ fontWeight: "700", fontSize: "x-large", textAlign: 'center', color: 'black' }}>We're thrilled to have you here.</h5>
      <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignSelf: 'center', width: "81vw" }}>
        <div style={{ display: "flex", flexDirection: 'row', border: "none", backgroundColor: 'white', borderRadius: "20px", height: "73vh", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
          <Carousel activeIndex={index} onSelect={handleNavigationClick} style={{ backgroundColor: 'transparent', width: "50vw", height: "60vh", alignSelf: "center", marginTop: "-15vh" }} interval={null}>
            <Carousel.Item>
              <div style={{ backgroundColor: " #FEFEFA", display: "flex", flexDirection: "column", height: "65vh", margin: "1vw" }}>
                <h5 style={{ fontWeight: "700", marginBottom: "1vh", paddingTop: "1vh", color: "black", textAlign: 'center' }}>But first, let's get to know you.</h5>
                <table style={{ padding: "5vh", marginTop: "-3vh" }}>
                  <tbody>
                    <tr style={{ height: "15vh" }}>
                      <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', width: '15vw', color: "#116D6E" }}>What's your Name?</label></td>
                      <td style={{ width: "50vw" }}><input placeholder="Name" style={{ width: "30vw", marginRight: "5vh", border: "solid 1px #87CBB9", marginTop: "1vw", borderRadius: "0px", backgroundColor: "transparent" }} type="text" value={name} onChange={(e) => setName(e.target.value)} required /></td>
                    </tr>
                    <tr style={{ height: "15vh", padding: "5vh" }}>
                      <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', width: '15vw', color: "#116D6E" }}>Where do you stay?</label></td>
                      <td><input placeholder="Home Location" style={{ width: "30vw", border: "solid 1px #87CBB9", marginTop: "3vh", borderRadius: "0px", backgroundColor: "transparent" }} type="text" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} required /></td>
                    </tr>
                    <tr style={{ height: "15vh", padding: "5vh" }}>
                      <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', width: '15vw', color: "#116D6E" }}>What's your EMail?</label></td>
                      <td><input placeholder="EMail Address" style={{ width: "30vw", border: "solid 1px #87CBB9", marginTop: "1vh", borderRadius: "0px", height: "7vh", paddingLeft: "1.5vh", backgroundColor: "transparent" }} type="text" value={email} onChange={(e) => setEMail(e.target.value)} required /></td>
                    </tr>
                    <tr style={{ height: "15vh", padding: "5vh" }}>
                      <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', width: '15vw', color: "#116D6E" }}>What's your Gender?</label></td>
                      <td><input placeholder="Gender" style={{ width: "30vw", border: "solid 1px #87CBB9", marginTop: "1vh", borderRadius: "0px", height: "7vh", paddingLeft: "1.5vh", backgroundColor: "transparent" }} type="text" value={gender} onChange={(e) => setGender(e.target.value)} required /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Carousel.Item>

            <Carousel.Item>
              <div style={{ backgroundColor: " #FEFEFA", display: "flex", flexDirection: "column", height: "65vh", margin: "1vw" }}>
                <h5 style={{ fontWeight: "700", paddingTop: "5vh", color: "black", textAlign: 'center' }}>Which Vehicle would you be driving?</h5>
                <h5 style={{ color: "black", textAlign: 'center' }}>PS. You can skip this section if you wish to enter without one!</h5>
                <div style={{ display: "flex", flexDirection: "row", alignSelf: "center", justifyContent: 'center', paddingTop: !(isChoosingVehicle) ? "15vh" : "1vh" }}>
                  <button onClick={() => setIsChoosingVehicle(true)} style={{ backgroundColor: "#14C38E", fontWeight: "700", marginLeft: "4vw", padding: '1.5vh', width: "16vw", color: "#FFFFFF", border: "none", alignSelf: "center", marginRight: "4vw", borderRadius: '10px' }}>
                    I have my own vehicle
                  </button>
                  <h4 style={{ color: 'black', fontWeight: "700", marginLeft: '-2vw', marginRight: '2vw' }}>OR</h4>
                  <button onClick={() => { setIsChoosingVehicle(false); handleSkipClick(); }} style={{ backgroundColor: "#EB5353", fontWeight: "700", padding: '1.5vh', width: "13vw", color: "#FFFFFF", border: "none", alignSelf: "center", marginRight: "4vw", borderRadius: '10px' }}>
                    Skip this for me
                  </button>
                  <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                    <Modal.Header>
                      <h4 style={{ fontWeight: "700", color: 'black' }}>Alert</h4>
                    </Modal.Header>
                    <Modal.Body style={{ textAlign: "center" }}>
                      <div style={{ alignSelf: "center", textAlign: "center" }}>
                        <h5 style={{ alignSelf: "center", fontWeight: "700", color: "black" }}>Hey there!</h5>
                      </div>
                      <p>Your request to access our platform without a host vehicle has been acknowledged. You may now close this alert and proceed to the next section of the application.</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <button onClick={handleCloseModal} style={{ backgroundColor: "#14C38E", padding: '1vh', color: '#FEFEFA', fontWeight: '700', borderRadius: "10px" }}>
                        Close
                      </button>
                    </Modal.Footer>
                  </Modal>
                </div>
                {isChoosingVehicle && (
                  <table style={{ marginTop: '3vh' }}>
                    <tbody>
                      <tr style={{ height: "15vh", padding: "5vh" }}>
                        <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', color: '#116D6E' }}>Vehicle Name and Type:</label></td>
                        <td><input placeholder="Vehicle Name" style={{ width: "30vw", marginRight: "5vh", border: "solid 1px #87CBB9", marginTop: "1vw", borderRadius: "0px", backgroundColor: "transparent" }} type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} required /></td>
                      </tr>
                      <tr style={{ height: "15vh", padding: "5vh" }}>
                        <td><label style={{ paddingLeft: '1vw', fontSize: '18px', fontWeight: '700', color: "#116D6E" }}>Vehicle Number:</label></td>
                        <td><input placeholder="Vehicle Number Plate" style={{ width: "30vw", marginRight: "5vh", border: "solid 1px #87CBB9", marginTop: "1vw", borderRadius: "0px", backgroundColor: "transparent" }} type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required /></td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </Carousel.Item>

            <Carousel.Item>
              <div style={{ backgroundColor: " #FEFEFA", display: "flex", flexDirection: "column", height: "65vh", margin: "1vw" }}>
                <h5 style={{ fontWeight: "700", paddingTop: "1vh", textDecoration: "underline", color: '#116D6E', textAlign: 'center' }}>Last Step: Some Points to Note Down</h5>
                <h5 style={{ marginBottom: "1vw", color: 'black', textAlign: 'center' }}>1. Make sure to re-check your details and ensure that you have filled all information correctly.</h5>
                <h5 style={{ fontWeight: "700", paddingTop: "1vh", textDecoration: "none", color: '#116D6E', textAlign: 'center', marginTop: "-2vh" }}>2. Acknowledgment</h5>
                <div style={{ display: "flex", flexDirection: "row", alignSelf: "center", marginTop: "1vh" }}>
                  <input style={{ marginTop: "4vh", marginLeft: "5vw", marginRight: "2vw", transform: "scale(1.5)", height: "20px", width: "20px" }} type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                  <span style={{ textAlign: "left", marginRight: "5vw", width: "43vw" }}>
                    <h5 style={{ color: 'black', textAlign: 'left', zIndex: '9999' }}>I hereby verify that all the information provided by me above is true, correct, and accurate to the best of my knowledge and belief. I understand that any falsification may have serious consequences & undermine the trust placed in me.</h5>
                  </span>
                </div>
                <h5 style={{ marginBottom: "1vw", marginTop: "0.5vw", color: 'black', textAlign: 'center' }}>3. When you're done, click on the button below to <b>submit your application for review</b>.</h5>
                <button
                  disabled={!isChecked}
                  style={{
                    alignSelf: "center",
                    zIndex: '9999',
                    backgroundColor: "#14C38E",
                    padding: "2vh",
                    fontWeight: "700",
                    marginTop: "-1vh",
                    color: "#FEFEFA",
                    cursor: !isChecked ? "not-allowed" : "pointer"
                  }}
                  onClick={async () => {
                    await handleNameUpdate();
                    const isWalletDifferent = walletAddressVerification();
                    const isEmailDifferent = emailVerification();
                    if (isWalletDifferent && isEmailDifferent) {
                      await createPassengerRequest();
                      if (flag) setShowRegistrationCompletionModal(true);
                    } else {
                      setShowDuplicateEntriesModal(true);
                    }
                  }}
                >
                  Complete & Submit Application
                </button>
                <Modal show={showDuplicateEntriesModal} onHide={handleDuplicateEntriesModal} size="lg" centered>
                  <Modal.Header>
                    <h4 style={{ fontWeight: "700", color: 'black' }}>Alert: Registration Unsuccessful!</h4>
                  </Modal.Header>
                  <Modal.Body style={{ textAlign: "center" }}>
                    <div style={{ alignSelf: "center", textAlign: "center" }}>
                      <h5 style={{ alignSelf: "center", fontWeight: "700", color: "black" }}>Hey there!</h5>
                    </div>
                    <h5 style={{ alignSelf: "center", color: "black" }}>The Metamask Account or Email Account provided has already been utilized to create an application within our system. We kindly request you to switch to an alternative account and try again.</h5>
                  </Modal.Body>
                  <Modal.Footer>
                    <button onClick={handleDuplicateEntriesModal} style={{ backgroundColor: "#14C38E", padding: '1vh', color: '#FEFEFA', fontWeight: '700', borderRadius: "10px" }}>
                      Close
                    </button>
                  </Modal.Footer>
                </Modal>
                <Modal show={showRegistrationCompletionModal} onHide={handleRegistrationModal} size="lg" centered>
                  <Modal.Header>
                    <h4 style={{ fontWeight: "700", color: 'black' }}>Alert: Registration Successful!</h4>
                  </Modal.Header>
                  <Modal.Body style={{ textAlign: "center" }}>
                    <div style={{ alignSelf: "center", textAlign: "center" }}>
                      <h5 style={{ alignSelf: "center", fontWeight: "700", color: "black" }}>Hey there!</h5>
                    </div>
                    <h5 style={{ alignSelf: "center", color: "black" }}>Your application to access our platform has been successfully created.</h5>
                    <h5 style={{ color: 'black' }}><b>Your Application ID: {passengerRequests.length}</b></h5>
                    <h5 style={{ color: '#FF8A8BWhblack' }}>Kindly ensure to make a note of the aforementioned identification as it shall be indispensable for future reference when checking the status of your application.</h5>
                  </Modal.Body>
                  <Modal.Footer>
                    <button onClick={handleRegistrationModal} style={{ backgroundColor: "#14C38E", padding: '1vh', color: '#FEFEFA', fontWeight: '700', borderRadius: "10px" }}>
                      Close
                    </button>
                  </Modal.Footer>
                </Modal>
              </div>
            </Carousel.Item>
          </Carousel>
          <div style={{ width: "30vw", paddingTop: "2vh", backgroundColor: "#87CBB9", marginTop: '2vh', marginBottom: '2vh', borderRadius: '20px' }}>
            <img src={imageh} style={{ height: "68vh", width: '21vw', borderRadius: '20px', marginLeft: "5vw", transform: 'scale(1.05)' }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: 'center', backgroundColor: "#87CBB9", flexDirection: 'row', marginTop: "-9vh", width: "30vw", marginLeft: "10vw", textAlign: 'center', height: "8vh", borderRadius: "20px 20px 0px 0px", zIndex: '9999' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: "-2vw" }}>
            <button className={index === 0 ? "active" : ""} onClick={() => handleNavigationClick(0)} style={{ marginLeft: '2vw', backgroundColor: index === 0 ? "white" : "transparent", alignSelf: 'center', transform: index === 0 ? "translateY(-20px)" : "none", borderRadius: index === 0 ? '100%' : '', width: index === 0 ? "50px" : "", height: index === 0 ? '50px' : '' }}>
              <div style={{ width: "35px", height: "35px", marginLeft: "0.5vw", marginBottom: '1vh', borderRadius: '100%', backgroundColor: index === 0 ? "#87CBB9" : "transparent" }}><CgProfile style={{ transform: 'scale(1.5)', color: 'white', marginTop: index === 0 ? '1vh' : '1vh' }}></CgProfile></div>
            </button>
            <p style={{ color: 'white', marginLeft: index === 0 ? '2vw' : '2.5vw', fontWeight: '700', fontSize: "small", marginTop: index === 0 ? '-2vh' : '-1vh' }}>Profile</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button className={index === 1 ? "active" : ""} onClick={() => handleNavigationClick(1)} style={{ marginLeft: '2vw', backgroundColor: index === 1 ? "white" : "transparent", alignSelf: 'center', transform: index === 1 ? "translateY(-20px)" : "none", borderRadius: index === 1 ? '100%' : '', width: index === 1 ? "50px" : "", height: index === 1 ? '50px' : '' }}>
              <div style={{ width: "35px", height: "35px", marginLeft: "0.5vw", marginBottom: '1vh', borderRadius: '100%', backgroundColor: index === 1 ? "#87CBB9" : "transparent" }}><GiCartwheel style={{ transform: 'scale(1.5)', color: 'white', marginTop: index === 1 ? '1vh' : '1vh' }}></GiCartwheel></div>
            </button>
            <p style={{ color: 'white', marginLeft: index === 1 ? '2vw' : '2.5vw', fontWeight: '700', fontSize: "small", marginTop: index === 1 ? '-2vh' : '-1vh' }}>Vehicle</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button className={index === (isChoosingVehicle ? 2 : 2) ? "active" : ""} onClick={() => handleNavigationClick(isChoosingVehicle ? 2 : 2)} style={{ marginLeft: '2vw', backgroundColor: index === (isChoosingVehicle ? 2 : 2) ? 'white' : 'transparent', alignSelf: 'center', transform: index === (isChoosingVehicle ? 2 : 2) ? 'translateY(-20px)' : 'none', borderRadius: index === (isChoosingVehicle ? 2 : 2) ? '100%' : '', width: index === (isChoosingVehicle ? 2 : 2) ? '50px' : '', height: index === (isChoosingVehicle ? 2 : 2) ? '50px' : '' }}>
              <div style={{ width: '35px', height: '35px', marginLeft: '0.5vw', marginBottom: '1vh', borderRadius: '100%', backgroundColor: index === (isChoosingVehicle ? 2 : 2) ? '#87CBB9' : 'transparent' }}><IoShieldHalf style={{ transform: 'scale(1.5)', color: 'white', marginTop: index === 2 ? '1vh' : '1vh' }}></IoShieldHalf></div>
            </button>
            <p style={{ color: 'white', marginLeft: index === (isChoosingVehicle ? 2 : 2) ? '2vw' : '2.5vw', fontWeight: 700, fontSize: 'small', marginTop: index === (isChoosingVehicle ? 2 : 2) ? '-2vh' : '-1vh' }}>Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdministratorDashboardUserRegistration;