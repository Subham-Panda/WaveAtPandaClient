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

  const contractAddress = "0x9470656d182f3AFb050dA14D7e53Ada0FBE68A58";
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

  const wave = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Ethereum object doesnt exist");
        return;
      } 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const waveAtPandaContract = new ethers.Contract(contractAddress, contractABI, signer);

      let count = await waveAtPandaContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());

      // Executing the actual wave funtion from the smart contract
      const waveTxn = await waveAtPandaContract.wave();
      console.log("Mining......",waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      count = await waveAtPandaContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      
    } catch(error) {
      console.error({error})
    }
  }

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if(account !== null) {
      setCurrentAccount(account);
    }
  },[])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Welcome to PandaVerse
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
          {totalWaves}
        </div>
      </div>
    </div>
  );
}
