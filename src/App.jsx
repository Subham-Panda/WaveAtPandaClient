import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WaveAtPanda.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */

const findMetaMaskAccount = async () => {
  try {
    const ethreum = getEthereumObject();

    // make sure we have acess to Ethereum object
    if(!ethereum) {
      console.error("You dont have metamask installed");
      return null;
    }

    console.log("Metamask is installed. Ethereum object is present: ", ethereum);
    const accounts = await ethereum.request({method: "eth_accounts"});

    if(accounts.length!=0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch(error) {
    console.log(error);
    return null;
  }
}

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("Fetching...")
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0xF89bF35E131F2ffEdAAC24CEB04d0CF9c3C9a574";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if(!ethereum) {
        alert("Get Metamask!!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      })

      console.log("Connected: ",accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch(error) {
      console.error(error);
    }
  }

  const fetchTotalWaves = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Ethereum object doesnt exist");
        return null;
      } 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const waveAtPandaContract = new ethers.Contract(contractAddress, contractABI, signer);

      let count = await waveAtPandaContract.getTotalWaves();
      console.log({count: count.toNumber()})
      return count.toNumber();
      
    } catch(error) {
      console.error({error})
    }
  }

  const wave = async () => {
    try {

      if(message.trim()==="") {
        alert("Message cant be empty")
        return;
      }
      
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Ethereum object doesnt exist");
        return;
      } 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const waveAtPandaContract = new ethers.Contract(contractAddress, contractABI, signer);

      const waveTxn = await waveAtPandaContract.wave(message);
      console.log("Mining......",waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      let count = await waveAtPandaContract.getTotalWaves();
      setTotalWaves(count.toNumber())

      await getAllWaves();

      setMessage("");
      
    } catch(error) {
      console.error({error})
    }
  }

 const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveAtPandaContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await waveAtPandaContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        console.log({wavesCleaned})

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.error({error});
    }
  }

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if(account !== null) {
      setCurrentAccount(account);
    }
    const waveCount = await fetchTotalWaves();
    if(waveCount !== null) {
      setTotalWaves(waveCount);
    }
    await getAllWaves();
  },[])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="waveMessage">
         <textarea rows="10" cols = "40" value={message} onChange={e=>setMessage(e.target.value)}/>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Panda
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="totalWaves">
         👋: {totalWaves}
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
