// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CarpoolingSystem {
    address public admin;
    uint256 public numPass;
    uint256 public numPassRequests;
    uint256 public numRides;
    string[] public allStopsAvailable;

    struct Passenger {
        uint256 PassID;
        string PassName;
        address payable PassWalletAddress;
        string PassHomeAddress;
        string PassVehicleDetailsHash;
        string PassGender;
        uint256 PassReview;
        uint256 PassRidesHosted;
        uint256 PassRidesTaken;
        string PassEMail;
        string PassVehicleName;
        string PassVehicleNumber;
        string ProfilePictureCID;
    }

    struct PassengerRequest {
        uint256 PassRequestID;
        string PassName;
        address payable PassWalletAddress;
        string PassHomeAddress;
        string PassVehicleDetailsHash;
        string PassGender;
        uint256 PassRequestStatus;
        string PassEMail;
        string PassVehicleName;
        string PassVehicleNumber;
    }

    struct Ride {
        uint256 RideID;
        string RideSourceLocation;
        string RideDestinationLocation;
        uint256 HostID;
        uint256[] PeersID;
        string[] Stops;
        uint256 RideFare; // Stored in Wei, input as Sepolia ETH
        uint256 RideSeatsAvailable;
        string[] RideUpdates;
        string[] RideDateandTime;
        bool isRideStarted;
        bool isRideEnded;
    }

    struct RidePassenger {
        uint256 PassID;
        string PassSourceLocation;
        string PassDestinationLocation;
        bool isOnRide;
        bool hasPaid;
        uint256 amountPaid; // Stored in Wei
    }

    mapping(uint256 => Passenger) public Passengers;
    mapping(uint256 => PassengerRequest) public PassengerRequests;
    mapping(uint256 => Ride) public Rides;
    mapping(uint256 => mapping(uint256 => RidePassenger)) public RidePassengers;
    mapping(uint256 => string) public PassengerJoiningDates;
    mapping(uint256 => uint256) public rideFareCollected;

    event PassengerRequestCreated(uint256 indexed ID, string NAME);
    event RideStarted(uint256 indexed rideId, bool isStarted);
    event RideCreated(uint256 indexed rideId, string source, string destination);
    event RideBooked(uint256 indexed rideId, uint256 indexed passengerId);
    event RideCancelledByHost(uint256 indexed rideId);
    event RideCancelledByPassenger(uint256 indexed rideId, uint256 indexed passengerId);
    event PassengerJoined(uint256 indexed rideId, uint256 indexed passengerId, string location);
    event PassengerLeft(uint256 indexed rideId, uint256 indexed passengerId, string location);
    event PaymentSent(uint256 indexed rideId, uint256 indexed passengerId, uint256 amount);
    event PaymentRefunded(uint256 indexed rideId, uint256 indexed passengerId, uint256 amount);
    event ProfilePictureUpdated(uint256 indexed passengerId, string cid);
    event ReviewUpdated(uint256 indexed passengerId, uint256 rating);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyPassenger(uint256 passId) {
        require(msg.sender == Passengers[passId].PassWalletAddress, "Not authorized");
        _;
    }

    function ApprovePassengerRequest(uint256 passreqid, string memory _date) external onlyAdmin {
        PassengerRequest storage request = PassengerRequests[passreqid];
        require(request.PassRequestStatus == 0, "Request already processed");
        
        numPass++;
        Passengers[numPass] = Passenger({
            PassID: numPass,
            PassName: request.PassName,
            PassWalletAddress: request.PassWalletAddress,
            PassHomeAddress: request.PassHomeAddress,
            PassVehicleDetailsHash: request.PassVehicleDetailsHash,
            PassGender: request.PassGender,
            PassReview: 0,
            PassRidesHosted: 0,
            PassRidesTaken: 0,
            PassEMail: request.PassEMail,
            PassVehicleName: request.PassVehicleName,
            PassVehicleNumber: request.PassVehicleNumber,
            ProfilePictureCID: ""
        });
        
        PassengerJoiningDates[numPass] = _date;
        request.PassRequestStatus = 1;
    }

    function RejectPassengerRequest(uint256 passreqid) external onlyAdmin {
        PassengerRequest storage request = PassengerRequests[passreqid];
        require(request.PassRequestStatus == 0, "Request already processed");
        request.PassRequestStatus = 2;
    }

    function CreatePassengerRequest(
        string memory name,
        string memory homeaddress,
        string memory detailshash,
        string memory gender,
        string memory email,
        string memory vehiclename,
        string memory vehiclenumber
    ) external {
        numPassRequests++;
        PassengerRequests[numPassRequests] = PassengerRequest({
            PassRequestID: numPassRequests,
            PassName: name,
            PassWalletAddress: payable(msg.sender),
            PassHomeAddress: homeaddress,
            PassVehicleDetailsHash: detailshash,
            PassGender: gender,
            PassRequestStatus: 0,
            PassEMail: email,
            PassVehicleName: vehiclename,
            PassVehicleNumber: vehiclenumber
        });
        emit PassengerRequestCreated(numPassRequests, name);
    }

    function CreateARide(
        string[] memory _dateandtime,
        string memory source,
        string memory destination,
        string[] memory stops,
        uint256 host,
        uint256 fareInEth, // Input as Sepolia ETH (e.g., 1 for 1 ETH)
        uint256 seats
    ) external onlyPassenger(host) {
        require(bytes(source).length > 0, "Source location cannot be empty");
        require(bytes(destination).length > 0, "Destination location cannot be empty");
        require(fareInEth > 0, "Fare must be greater than 0");
        require(seats > 0, "Seats must be greater than 0");

        numRides++;
        uint256[] memory emptyPeers;
        string[] memory emptyUpdates;
        
        // Convert fare from Sepolia ETH to Wei
        uint256 fareInWei = fareInEth * 10**18; // Multiply by 10^18 to convert ETH to Wei
        
        Rides[numRides] = Ride({
            RideID: numRides,
            RideSourceLocation: source,
            RideDestinationLocation: destination,
            HostID: host,
            PeersID: emptyPeers,
            Stops: stops,
            RideFare: fareInWei, // Store in Wei
            RideSeatsAvailable: seats,
            RideUpdates: emptyUpdates,
            RideDateandTime: _dateandtime,
            isRideStarted: false,
            isRideEnded: false
        });

        Passengers[host].PassRidesHosted++;
        emit RideCreated(numRides, source, destination);
    }

    function CancelRideAsHost(uint256 rideId) external {
        Ride storage ride = Rides[rideId];
        require(ride.HostID > 0, "Ride does not exist");
        require(msg.sender == Passengers[ride.HostID].PassWalletAddress, "Only host can cancel");
        require(!ride.isRideStarted, "Cannot cancel started ride");
        require(!ride.isRideEnded, "Ride already ended");

        // Refund all passengers who booked
        for (uint256 i = 0; i < ride.PeersID.length; i++) {
            uint256 passengerId = ride.PeersID[i];
            RidePassenger storage passenger = RidePassengers[rideId][passengerId];
            if (passenger.amountPaid > 0 && !passenger.hasPaid) {
                Passengers[passengerId].PassWalletAddress.transfer(passenger.amountPaid);
                emit PaymentRefunded(rideId, passengerId, passenger.amountPaid);
                passenger.amountPaid = 0;
            }
        }

        ride.isRideEnded = true;
        ride.RideUpdates.push("Ride cancelled by host");
        Passengers[ride.HostID].PassRidesHosted--;
        emit RideCancelledByHost(rideId);
    }

    function CancelRideAsPassenger(uint256 rideId, uint256 passengerId) external onlyPassenger(passengerId) {
        Ride storage ride = Rides[rideId];
        require(ride.RideID > 0, "Ride does not exist");
        require(!ride.isRideStarted, "Cannot cancel started ride");
        require(!ride.isRideEnded, "Ride already ended");

        RidePassenger storage passenger = RidePassengers[rideId][passengerId];
        require(passenger.PassID > 0, "Passenger not booked on this ride");

        // Refund the passenger
        if (passenger.amountPaid > 0 && !passenger.hasPaid) {
            Passengers[passengerId].PassWalletAddress.transfer(passenger.amountPaid);
            emit PaymentRefunded(rideId, passengerId, passenger.amountPaid);
        }

        // Remove passenger from PeersID array
        for (uint256 i = 0; i < ride.PeersID.length; i++) {
            if (ride.PeersID[i] == passengerId) {
                ride.PeersID[i] = ride.PeersID[ride.PeersID.length - 1];
                ride.PeersID.pop();
                break;
            }
        }

        ride.RideSeatsAvailable += 1;
        ride.RideUpdates.push(string(abi.encodePacked("Passenger ", uint2str(passengerId), " cancelled their booking")));
        
        delete RidePassengers[rideId][passengerId];
        emit RideCancelledByPassenger(rideId, passengerId);
    }

    function startRide(uint256 rideId) external {
        Ride storage ride = Rides[rideId];
        require(ride.HostID > 0, "Ride does not exist");
        require(msg.sender == Passengers[ride.HostID].PassWalletAddress, "Only ride host can start the ride");
        require(!ride.isRideStarted, "Ride already started");
        require(!ride.isRideEnded, "Ride already ended");

        ride.isRideStarted = true;
        ride.RideUpdates.push("Ride started by host");
        emit RideStarted(rideId, true);
    }
   
    function UpdateAllStopsAvailable(string[] memory newStops) external onlyAdmin {
        for (uint i = 0; i < newStops.length; i++) {
            if (!isStopExists(newStops[i])) {
                allStopsAvailable.push(newStops[i]);
            }
        }
    }

    function isStopExists(string memory stop) internal view returns (bool) {
        for (uint i = 0; i < allStopsAvailable.length; i++) {
            if (keccak256(bytes(allStopsAvailable[i])) == keccak256(bytes(stop))) {
                return true;
            }
        }
        return false;
    }

    function BookARide(
        uint256 peerid,
        uint256 rideid,
        string memory source,
        string memory destination
    ) external payable onlyPassenger(peerid) {
        Ride storage ride = Rides[rideid];
        require(ride.RideID > 0, "Ride does not exist");
        require(!ride.isRideStarted, "Ride already started");
        require(!ride.isRideEnded, "Ride already ended");
        require(ride.RideSeatsAvailable >= 1, "Not enough seats");
        require(peerid != ride.HostID, "Host cannot book their own ride");
        require(msg.value >= ride.RideFare, "Insufficient payment"); // ride.RideFare is in Wei
        
        bool alreadyBooked = false;
        for (uint256 i = 0; i < ride.PeersID.length; i++) {
            if (ride.PeersID[i] == peerid) {
                alreadyBooked = true;
                break;
            }
        }
        require(!alreadyBooked, "Already booked this ride");

        ride.PeersID.push(peerid);
        ride.RideSeatsAvailable -= 1;
        
        RidePassengers[rideid][peerid] = RidePassenger({
            PassID: peerid,
            PassSourceLocation: source,
            PassDestinationLocation: destination,
            isOnRide: false,
            hasPaid: false,
            amountPaid: msg.value // Stored in Wei
        });

        emit RideBooked(rideid, peerid);
    }

    function endRide(uint256 rideId) external {
        Ride storage ride = Rides[rideId];
        require(ride.HostID > 0, "Ride does not exist");
        require(msg.sender == Passengers[ride.HostID].PassWalletAddress, "Only ride host can end the ride");
        require(ride.isRideStarted, "Ride not started yet");
        require(!ride.isRideEnded, "Ride already ended");

        ride.isRideEnded = true;
        ride.RideUpdates.push("Ride ended by host");

        for (uint256 i = 0; i < ride.PeersID.length; i++) {
            Passengers[ride.PeersID[i]].PassRidesTaken++;
        }
    }

    function MarkPassengerJoining(
        uint256 passid, 
        uint256 rideid, 
        string memory _location
    ) external {
        RidePassenger storage passenger = RidePassengers[rideid][passid];
        require(passenger.PassID > 0, "Passenger not found");
        Ride storage ride = Rides[rideid];
        require(ride.isRideStarted, "Ride not started yet");
        require(!ride.isRideEnded, "Ride already ended");
        require(
            msg.sender == Passengers[ride.HostID].PassWalletAddress || 
            msg.sender == Passengers[passid].PassWalletAddress, 
            "Not authorized"
        );
        
        passenger.isOnRide = true;
        ride.RideUpdates.push(string(abi.encodePacked("Passenger ", uint2str(passid), " joined at ", _location)));
        emit PassengerJoined(rideid, passid, _location);
    }

    function MarkPassengerLeaving(
        uint256 passid, 
        uint256 rideid, 
        string memory _location
    ) external payable {
        RidePassenger storage passenger = RidePassengers[rideid][passid];
        require(passenger.PassID > 0, "Passenger not found");
        Ride storage ride = Rides[rideid];
        require(ride.isRideStarted, "Ride not started yet");
        require(!ride.isRideEnded, "Ride already ended");
        require(
            msg.sender == Passengers[ride.HostID].PassWalletAddress || 
            msg.sender == Passengers[passid].PassWalletAddress, 
            "Not authorized"
        );
        require(passenger.isOnRide, "Passenger not on ride");
        require(!passenger.hasPaid, "Already paid");
        
        passenger.isOnRide = false;
        passenger.hasPaid = true;
        
        uint256 amount = passenger.amountPaid; // In Wei
        require(amount > 0, "No payment amount set");
        Passengers[ride.HostID].PassWalletAddress.transfer(amount);
        
        ride.RideUpdates.push(string(abi.encodePacked("Passenger ", uint2str(passid), " left at ", _location, " and paid ", uint2str(amount), " wei")));
        emit PassengerLeft(rideid, passid, _location);
        emit PaymentSent(rideid, passid, amount);
    }

    function updatePassengerReview(uint256 passid, uint256 feedback) external {
        require(feedback >= 1 && feedback <= 5, "Rating must be between 1 and 5");
        require(passid > 0 && passid <= numPass, "Invalid passenger ID");
        
        uint256 reviewerPassId;
        bool reviewerFound;
        for (uint256 i = 1; i <= numPass; i++) {
            if (Passengers[i].PassWalletAddress == msg.sender) {
                reviewerPassId = i;
                reviewerFound = true;
                break;
            }
        }
        require(reviewerFound, "Reviewer not registered");
        
        bool hasRiddenWith;
        for (uint256 i = 1; i <= numRides; i++) {
            Ride storage ride = Rides[i];
            bool reviewerInRide = (ride.HostID == reviewerPassId || isInArray(ride.PeersID, reviewerPassId));
            bool revieweeInRide = (ride.HostID == passid || isInArray(ride.PeersID, passid));
            
            if (reviewerInRide && revieweeInRide) {
                hasRiddenWith = true;
                break;
            }
        }
        require(hasRiddenWith, "You must have ridden together");

        Passengers[passid].PassReview = feedback;
        emit ReviewUpdated(passid, feedback);
    }

    function isInArray(uint256[] memory array, uint256 element) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) return true;
        }
        return false;
    }

    function GetnumPassengers() external view returns (uint256) {
        return numPass;
    }

    function GetnumPassRequests() external view returns (uint256) {
        return numPassRequests;
    }

    function GetnumRides() external view returns (uint256) {
        return numRides;
    }

    function GetPassDetails(uint256 passid) external view returns (Passenger memory) {
        return Passengers[passid];
    }

    function GetPassRequestDetails(uint256 passreqid) external view returns (PassengerRequest memory) {
        return PassengerRequests[passreqid];
    }

    function GetRideDetails(uint256 rideid) external view returns (
        uint256 RideID,
        string memory RideSourceLocation,
        string memory RideDestinationLocation,
        uint256 HostID,
        uint256[] memory PeersID,
        string[] memory Stops,
        uint256 RideFare,
        uint256 RideSeatsAvailable,
        string[] memory RideUpdates,
        string[] memory RideDateandTime,
        bool isRideStarted,
        bool isRideEnded
    ) {
        require(rideid > 0 && rideid <= numRides, "Invalid ride ID");
        Ride memory ride = Rides[rideid];
        return (
            ride.RideID,
            ride.RideSourceLocation,
            ride.RideDestinationLocation,
            ride.HostID,
            ride.PeersID,
            ride.Stops,
            ride.RideFare,
            ride.RideSeatsAvailable,
            ride.RideUpdates,
            ride.RideDateandTime,
            ride.isRideStarted,
            ride.isRideEnded
        );
    }

    function GetPassDateJoined(uint256 passid) external view returns (string memory) {
        return PassengerJoiningDates[passid];
    }

    function getProfilePicture(uint256 passid) external view returns (string memory) {
        return Passengers[passid].ProfilePictureCID;
    }

    function getAllStopsAvailable() external view returns (string[] memory) {
        return allStopsAvailable;
    }

    function GetRidePassengersDetails(uint256 rideid, uint256 passid) external view returns (
        string memory,
        string memory,
        bool,
        bool,
        uint256
    ) {
        RidePassenger memory passenger = RidePassengers[rideid][passid];
        return (
            passenger.PassSourceLocation,
            passenger.PassDestinationLocation,
            passenger.isOnRide,
            passenger.hasPaid,
            passenger.amountPaid
        );
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function withdrawFunds() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
}