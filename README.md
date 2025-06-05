# Carpooling-dapp
<b>A decentralized carpooling application based on Ethereum Blockchain.</b>

<details>
<summary>Table of Contents</summary>

- [Description](#description)
- [Links](#links)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Applications](#applications)
- [Project Setup](#project-setup)
- [Usage](#usage)
- [Team Members](#team-members)


</details>

## 📝Description

Currently, most carpooling systems are in the control of the industry giants like Ola, Uber and several others. Thave all the data of drivers as well as of riders and this can lead to major privacy issues.
This project therefore aims to move ride-sharing and car hire are to blockchain in order to build a much more secure and reliable carpooling system that would connect the rider and driver directly using "smart contracts" without the intervention of any third party.

1. **Decentralized Network**: A Carpooling Dapp platform based on blockchain operates on a decentralized network, eliminating the need for intermediaries.
2. **Secure Transactions**: The platform uses blockchain technology to secure and track transactions between users, ensuring the safety and transparency of financial transactions.
3. **Smart Contracts**: The platform can be powered by smart contracts, automatically executing the terms of a carpooling agreement without intermediaries.
4. **Data Privacy**: User data is protected by the immutable and secure nature of blockchain technology, ensuring privacy and security.
## 🔗Links

- [GitHub Repository](https://github.com/zainab-06-p/Carpooling-dapp)
- [Drive Link to Screenshots of your project](https://drive.google.com/drive/folders/1TI-pOOhVZzD3nKPgHq3yxt_7_IsRWv6k?usp=sharing)


## 🤖Tech-Stack

#### Front-end
- HTML/CSS
- JavaScript
- ReactJS
- LeafletJS [Documentation](https://leafletjs.com/reference.html)
- ReduxJS [Documentation](https://redux.js.org/introduction/getting-started)
- web3.js [Documentation](https://web3py.readthedocs.io/en/v5/)

#### Back-end
- Node.js [Documentation](https://nodejs.org/en/docs/)
- Express.js [Documentation](https://devdocs.io/express/)
- socket.io [Documentation](https://socket.io/docs/v4/)

#### Database
- MongoDB [Documentation](https://www.mongodb.com/docs/)
- CORS Blocker [Documentation](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)

#### Extensions
- Metamask [Documentation](https://docs.metamask.io/guide/)

#### Additional Softwares
- Remix IDE [Documentation](https://remix-ide.readthedocs.io/en/latest/)


#### File Structure
<details>
  
  ```
📦master
 ┣ 📂backend
 ┃ ┗ 📂Schema
 ┃ ┃  ┗ 📜 ChatModel.js
 ┃ ┃  ┗ 📜 MessageModel.js                               
 ┃ ┗ 📂Routes 
 ┃ ┃  ┗ 📜 auth.js
 ┃ ┃  ┗ 📜 ChatRoute.js                                
 ┃ ┗ 📜db.js                                  
 ┃ ┗ 📜index.js                             
 ┃ ┗ 📜package.json                                                      
 ┃ ┗ 📜package-lock.json
 ┣ 📂public
 ┣ 📂src                          
 ┃ ┗ 📂assets                                 # Contains assets like fonts, images used in the UI
 ┃ ┃ ┗ 📂font
 ┃ ┃ ┗ 📂Images
 ┃ ┃ ┗ 📂img  
 ┃ ┗ 📂reducers                               #files to determine the response to the change of states of the Provider store                
 ┃ ┃ ┗ 📜allarrayReducer.js
 ┃ ┃ ┗ 📜rootReducer.js
 ┃ ┗ 📂components                             
 ┃ ┃ ┗ 📂ABI                                  #specifications of how to interact with the smart contract deployed on sepolia test network
 ┃ ┃ ┃  ┗ 📜contracttestingABI.json
 ┃ ┃ ┗ 📂actions                               #files to change the states of the Provider store
 ┃ ┃ ┃  ┗ 📜actions.js
 ┃ ┃ ┃  ┗ 📜allarrayActions.js
 ┃ ┃ ┃  ┗ 📜destinationAddressActions.js
 ┃ ┃ ┃  ┗ 📜sourceAddressActions.js
 ┃ ┃ ┗ 📂homepagecomponents                    #components used in designing the homepage
 ┃ ┃ ┃  ┗ 📜Banner.js
 ┃ ┃ ┃  ┗ 📜Contact.js
 ┃ ┃ ┃  ┗ 📜Footer.js
 ┃ ┃ ┃  ┗ 📜MailchimpForm.js
 ┃ ┃ ┃  ┗ 📜NavBar.js
 ┃ ┃ ┃  ┗ 📜NavBar2.js
 ┃ ┃ ┃  ┗ 📜Newsletter.js
 ┃ ┃ ┃  ┗ 📜ProjectCard.js
 ┃ ┃ ┃  ┗ 📜Projects.js
 ┃ ┃ ┃  ┗ 📜Skills.js
 ┃ ┃ ┗ 📂images
 ┃ ┃ ┗ 📂javascripts                                              #components used in the website                     
 ┃ ┃ ┃  ┗ 📜administrator-dashboard-enrolled-passengers.jsx
 ┃ ┃ ┃  ┗ 📜administrator-dashboard-requests.jsx
 ┃ ┃ ┃  ┗ 📜Chat.jsx
 ┃ ┃ ┃  ┗ 📜CurrentRide.jsx
 ┃ ┃ ┃  ┗ 📜HomePageFinal.jsx
 ┃ ┃ ┃  ┗ 📜LoginPage.jsx
 ┃ ┃ ┃  ┗ 📜my-current-rides-booked.jsx
 ┃ ┃ ┃  ┗ 📜RideHistory.jsx
 ┃ ┃ ┃  ┗ 📜RideInbox.jsx
 ┃ ┃ ┃  ┗ 📜SignUpPage.jsx
 ┃ ┃ ┃  ┗ 📜TopSection.jsx
 ┃ ┃ ┃  ┗ 📜user-application-status.jsx
 ┃ ┃ ┃  ┗ 📜user-registration.jsx
 ┃ ┃ ┗ 📂stylesheets                                              #Styling for all components used
 ┃ ┃ ┃  ┗ 📜administrator-dashboard-requests.css
 ┃ ┃ ┃  ┗ 📜HomePage.css
 ┃ ┃ ┃  ┗ 📜LoginPage.css
 ┃ ┃ ┃  ┗ 📜UserDashboard.css
 ┃ ┃ ┗ 📂testing-javascripts                                      #components used in the website  
 ┃ ┃ ┃  ┗ 📂actions
 ┃ ┃ ┃ ┃  ┗ 📜allarrayActions.js
 ┃ ┃ ┃ ┃  ┗ 📜setDestinationActions.js
 ┃ ┃ ┃ ┃  ┗ 📜setSourceActions.js
 ┃ ┃ ┃ ┃  ┗ 📜setStopsActions.js
 ┃ ┃ ┃  ┗ 📂reducers
 ┃ ┃ ┃ ┃  ┗ 📜allarrayReducer.js
 ┃ ┃ ┃ ┃  ┗ 📜destinationAddressReducer.js
 ┃ ┃ ┃ ┃  ┗ 📜mainMapRootReducer.js
 ┃ ┃ ┃ ┃  ┗ 📜sourceAddressReducer.js
 ┃ ┃ ┃ ┃  ┗ 📜stopsReducer.js
 ┃ ┃ ┃  ┗ 📜Dashboard.jsx
 ┃ ┃ ┃  ┗ 📜LeafletGeocoder.jsx
 ┃ ┃ ┃  ┗ 📜Login.jsx
 ┃ ┃ ┃  ┗ 📜mainMap.jsx
 ┃ ┃ ┃  ┗ 📜profile-picture-editor.jsx
 ┃ ┃ ┃  ┗ 📜StartARidePage.jsx
 ┃ ┃ ┃  ┗ 📜view-all-rides.jsx
 ┃ ┗ 📜App.css             
 ┃ ┗ 📜App.js                               # Main file             
 ┃ ┗ 📜App.test.js            
 ┃ ┗ 📜index.css           
 ┃ ┗ 📜index.js                              # Renders App.js      
 ┃ ┗ 📜logo.svg                 
 ┣ 📜README.md                              
 ┗ 📜package.xml
 
 ```

    

</details>



## 💸Applications

Carpooling Dapp based on blockchain has the potential to solve several real-life problems, including:

* **Traffic Congestion**: By incentivizing carpooling, the platform can help reduce the number of cars on the road, reducing traffic congestion and improving sustainability.

* **Inefficient and Costly Transportation**: Carpooling can provide an affordable and efficient alternative to individual transportation, reducing costs for both drivers and riders.

* **Lack of Trust**: Blockchain technology can provide a secure and transparent environment for carpooling, helping to build trust between users and reducing the risk of fraud or exploitation.

Applications of the platform can include:

* **Urban Commuting**: The platform can be used by city residents to carpool to work or other destinations, reducing traffic congestion and air pollution.

* **Long-distance Travel**: The platform can be used for long-distance travel, allowing drivers to offset the cost of gas and tolls by offering rides to passengers traveling in the same direction.

* **Event Transportation**: The platform can be used for event transportation, allowing attendees to share rides and reduce traffic congestion around event venues.

Monetization of the platform can be achieved through:

* **Commission on Transactions**: The platform can charge a small commission on each transaction, earning revenue from the financial transactions made on the platform.

* **Advertising**: The platform can sell advertising space to businesses, earning revenue from advertising campaigns.

* **Premium Services**: The platform can offer premium services for a fee, such as guaranteed ride matching or premium carpooling experiences.

* **Token System**: The platform can use a token system to incentivize users to participate in carpooling, and sell tokens to generate revenue.
## 🛠Project Setup

> Want to setup this project on your machine? Follow these steps:

* STEP 1: [Install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm): Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside of a web browser. It allows developers to build server-side applications in JavaScript and run them on the server. It includes a rich library of modules, known as npm (Node Package Manager), that enables developers to add functionality to their applications quickly and easily. It is widely used for web application development, building networked applications, and developing server-side scripts.
* STEP 2: [Install and configure MongoDB Compass](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/) MongoDB is a popular, open-source NoSQL database management system. It is classified as a document-oriented database, which means that it stores data in the form of documents (in BSON format) instead of traditional table-based relational databases.
* STEP 3: [Install Metamask Extension](https://metamask.io/) MetaMask is a browser extension and mobile app that provides an interface for interacting with decentralized applications (dApps) built on the Ethereum blockchain. It allows users to securely store, manage, and send Ethereum and other Ethereum-based tokens, as well as interact with dApps in a user-friendly way.
* STEP 4: [Configure a Metamask Account](https://docs.metamask.io/guide/#why-metamask)
* STEP 5: Navigate to the repository and clone it: [Clone our GitHub Respository](https://github.com/zainab-06-p/Carpooling-dapp)
## 💻Usage

In the root directory, install all the dependencies of the frontend by running the command:
### `npm install`

Navigate to the \backend directory, and then install the dependencies of the backend by running the command:
### `npm install`

Navigate back to the root directory, and then execute the frontend by running the command:
### `npm start`

Execute the backend by running the command:
### `nodemon index.js`

## 👨‍💻Team Members

- [Zainab Pirjade - ](https://github.com/zainab-06-p/Carpooling-dapp) 
- Anushka Darunkar 
- Shreyas Manore

