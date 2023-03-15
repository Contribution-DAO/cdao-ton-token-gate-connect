import { SendTransactionRequest } from "@tonconnect/sdk";
import React, { useState } from "react"
import { useRecoilValueLoadable } from "recoil";
import { sendTransaction } from "src/connector";
import { useTonWallet } from "src/hooks/useTonWallet";
import { walletsListQuery } from "src/state/wallets-list";
import { TonProofDemoApi } from "src/TonProofDemoApi";
import { encodeOffChainContent } from "src/utils/NftCollection";
import { Address, beginCell, toNano } from "ton-core";
import TonWeb from "tonweb";

const urlParams = new URLSearchParams(window.location.search);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default function MintButton({ approvalId, onMint }: { approvalId: string, onMint: Function }) {
  const [loading, setLoading] = useState(false)
  const wallet = useTonWallet();
	const walletsList = useRecoilValueLoadable(walletsListQuery);
  const walletAddress = Address.parse(wallet?.account.address as string);

  const metadata = encodeOffChainContent(approvalId, false)

  const coinAmount = toNano('0.05')
  const nftPayload = beginCell().storeAddress(walletAddress).storeRef(metadata).storeAddress(walletAddress).endCell();
  const payload = beginCell().storeUint(1, 32).storeCoins(coinAmount).storeRef(nftPayload).endCell()

  console.log(payload.toString())

  const mintTx: SendTransactionRequest = {
    validUntil: Date.now() + 1000000,
    messages: [
      {
        address: Address.parse(process.env.REACT_APP_TON_COLLECTION_ADDRESS as string).toRawString(),
        amount: coinAmount.toString(),
        payload: TonWeb.utils.bytesToBase64(payload.toBoc()),
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

          for (let i = 0; i < 3; i++) {
            try {
              await wait(40000)
              await TonProofDemoApi.submitSbt(approvalId)
              break
            } catch (err) {
              if (i >= 2) throw err
            }
          }

          onMint()
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