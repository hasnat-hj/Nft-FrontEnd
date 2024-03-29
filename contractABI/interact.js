import { ethers } from "ethers";

import axiosInstance from "../utils/axiosInterceptor.js";
import Marketplace from "./marketplace.json";
import Auction from "./auction.json";
import NFT from "./nft.json";
import { pinJSONToIPFS } from "./pinata.js";

export const loadContracts = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const chainId = provider.getNetwork();
  const signer = provider.getSigner();

  // if (chainId === 80001) {

  // Get deployed copies of contracts
  var marketplace = new ethers.Contract(
    "0x70B6856af810FB2d845B7ca25282e9690eE46b22",
    Marketplace.abi,
    signer
  );

  var auction = new ethers.Contract(
    "0xb4a5D0d225aF378a25Ea2EC3B2618768bc99c03b",
    Auction.abi,
    signer
  );

  var nft = new ethers.Contract(
    "0xb47c604A3F94a9f1bF205898accc11CfF5e27587",
    NFT.abi,
    signer
  );

  // } else if (chainId === 5) {
  //   console.log(chainId)
  //   var marketplace = new ethers.Contract(
  //     "0xb4a5d0d225af378a25ea2ec3b2618768bc99c03b",
  //     Marketplace.abi,
  //     signer
  //   );

  //   var auction = new ethers.Contract(
  //     "0x4550dc4a799178207F5303f7152056696dFC8525",
  //     Auction.abi,
  //     signer
  //   );
  //   //setMarketplace(marketplace)
  //   var nft = new ethers.Contract(
  //     "0x70B6856af810FB2d845B7ca25282e9690eE46b22",
  //     NFT.abi,
  //     signer
  //   );
  // }

  const addressArray = await window.ethereum.request({
    method: "eth_accounts",
  });
  if (addressArray.length > 0) {
    return {
      marketplace: marketplace,
      auction: auction,
      nft: nft,
      address: addressArray[0],
      status: "",
    };
  } else {
    return {
      address: "",
      status: "🦊 Connect to Metamask using the top right button.",
    };
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Metamask successfuly connected.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://metamask.io/download.html`}
            >
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://metamask.io/download.html`}
            >
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const accountChangeHandler = async () => {
  const { address } = await getCurrentWalletConnected();

  // Requesting balance method
  const balance = await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });

  return ethers.utils.formatEther(balance);
};

export const mintNFT = async (
  url,
  name,
  description,
  price,
  minBid,
  duration,
  nft,
  marketplace,
  auction,
  select,
  image,
  walletAddress
) => {
  if (url === "" || name.trim() === "" || description.trim() === "") {
    return {
      success: false,
      status: "Please make sure all fields are completed before minting.",
      id: 0,
    };
  }

  const metadata = {};
  metadata.name = name;
  metadata.image = url;
  metadata.description = description;

  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "Something went wrong while uploading your tokenURI.",
      id: 0,
    };
  }
  const tokenURI = pinataResponse.pinataUrl;
  console.log(tokenURI);

  const link = await nft.mint(tokenURI);
  var nftId;
  if (select === 1) {
    await nft.setApprovalForAll(marketplace.address, true);
    const id = await nft.tokenCount();

    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await marketplace.makeItem(nft.address, id, listingPrice);
    nftId = await marketplace.itemCount();
    if (nftId) {
      const formData = new FormData();
      formData.append("id", nftId);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("nftImage", image);
      formData.append("isBuy", false);
      formData.append("owner", walletAddress);

      await axiosInstance
        .post("/nft/createNft", formData, {})
        .then((response) => console.log(response));
      //activity
      await axiosInstance
        .post("/activity/", {
          collectionId: "3",
          itemName: name,
          events: "minted",
          price: price,
          from: walletAddress,
          to: "0x00",
          transactionHash: "0x00",
        })
        .then((response) => console.log(response));
    }
  } else {
    await nft.setApprovalForAll(auction.address, true);
    const id = await nft.tokenCount();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(minBid.toString());
    duration = new Date(duration).getTime() / 1000;
    await auction.createTokenAuction(nft.address, id, listingPrice, duration);
    nftId = await auction.itemCount();
    const item = await auction.items(nftId);

    //const aucitem = await auction.getTokenAuctionDetails(item.nft, item.tokenID)
    if (nftId) {
      const formData = new FormData();
      formData.append("id", item.tokenID);
      formData.append("name", name);
      formData.append("minbid", minBid);
      formData.append("curbid", 0);
      formData.append("duration", duration);
      formData.append("nftImage", image);
      formData.append("isBuy", false);
      formData.append("owner", walletAddress);
      await axiosInstance
        .post("/Anft/createAuctionNft", formData, {})
        .then((response) => console.log(response));
      //activity
      await axiosInstance
        .post("/activity/", {
          collectionId: "4",
          itemName: name,
          events: "auction",
          price: minBid,
          from: walletAddress,
          to: "0x00",
          transactionHash: "0x00",
        })
        .then((response) => console.log(response));
    }
  }

  return {
    success: true,
    status:
      "Check out your transaction on Etherscan: https://testnet.bscscan.com/tx/" +
      link.hash,
    id: nftId,
  };
};
