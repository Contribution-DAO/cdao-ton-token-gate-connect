import { SendTransactionRequest } from "@tonconnect/sdk";
import React, { useState } from "react"
import { useRecoilValueLoadable } from "recoil";
import { sendTransaction } from "src/connector";
import { useTonWallet } from "src/hooks/useTonWallet";
import { walletsListQuery } from "src/state/wallets-list";
import { TonProofDemoApi } from "src/TonProofDemoApi";
import { encodeOffChainContent } from "src/utils/NftCollection";
import { Address, beginCell, toNano } from "ton-core";

const urlParams = new URLSearchParams(window.location.search);

export default function MintButton({ approvalId, onMint }: { approvalId: string, onMint: Function }) {
  const [loading, setLoading] = useState(false)
  const wallet = useTonWallet();
	const walletsList = useRecoilValueLoadable(walletsListQuery);

  const metadata = encodeOffChainContent(approvalId)

  console.log(beginCell().storeUint(1, 32).storeRef(metadata).endCell().toString())

  const mintTx: SendTransactionRequest = {
    validUntil: Date.now() + 1000000,
    messages: [
      {
        address: Address.parse(process.env.REACT_APP_TON_COLLECTION_ADDRESS as string).toRawString(),
        amount: toNano('0.05').toString(),
        payload: beginCell().storeUint(1, 32).storeRef(metadata).endCell().toString(),
      },
    ],
  };

  return (
    <div
      className="social-login-btn"
      style={{
        backgroundColor: "#34A2ED",
        width: 200,
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? "none" : "auto",
      }}
      onClick={async () => {
        setLoading(true)

        try {
          await sendTransaction(mintTx, walletsList.contents.walletsList[0])
        } catch (err) {
          console.error(err)
          window.alert("Mint failed")
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? "Minting..." : "Mint SBT"}
    </div>
  )
}