import { DownOutlined } from '@ant-design/icons';
import { WalletInfoRemote } from '@tonconnect/sdk';
import { Button, Dropdown, Menu, Modal, notification, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useRecoilValueLoadable } from 'recoil';
import { addReturnStrategy, connector } from 'src/connector';
import { useForceUpdate } from 'src/hooks/useForceUpdate';
import { useSlicedAddress } from 'src/hooks/useSlicedAddress';
import { useTonWallet } from 'src/hooks/useTonWallet';
import { useTonWalletConnectionError } from 'src/hooks/useTonWalletConnectionError';
import { authPayloadQuery } from 'src/state/auth-payload';
import { walletsListQuery } from 'src/state/wallets-list';
import { TonProofDemoApi } from 'src/TonProofDemoApi';
import { isMobile, openLink } from 'src/utils';
import './style.scss';

const menu = (
	<Menu
		onClick={() => connector.disconnect()}
		items={[
			{
				label: 'Disconnect',
				key: '1',
			},
		]}
	/>
);

export function AuthButton({ onWalletChange }: { onWalletChange?: Function }) {
const [modalUniversalLink, setModalUniversalLink] = useState('');
	const forceUpdate = useForceUpdate();
	const wallet = useTonWallet();
	const onConnectErrorCallback = useCallback(() => {
		setModalUniversalLink('');
		notification.error({
			message: 'Connection was rejected',
			description: 'Please approve connection to the dApp in your wallet.',
		});
	}, []);
	useTonWalletConnectionError(onConnectErrorCallback);

	const walletsList = useRecoilValueLoadable(walletsListQuery);
	const authPayload = useRecoilValueLoadable(authPayloadQuery);

	const address = useSlicedAddress(wallet?.account.address);

	useEffect(() => {
		if (modalUniversalLink && wallet) {
			setModalUniversalLink('');
		}
	}, [modalUniversalLink, wallet]);

	const handleButtonClick = useCallback(async () => {
		// Use loading screen/UI instead (while wallets list is loading)
		if (!(walletsList.state === 'hasValue') || !(authPayload.state === 'hasValue')) {
			setTimeout(handleButtonClick, 200);
			return;
		}

		if (walletsList.contents.embeddedWallet) {
			connector.connect(
				{ jsBridgeKey: walletsList.contents.embeddedWallet.jsBridgeKey },
				{ tonProof: authPayload.contents.tonProofPayload },
			);
			return;
		}

		const tonkeeperConnectionSource = {
			universalLink: (walletsList.contents.walletsList[0] as WalletInfoRemote).universalLink,
			bridgeUrl: (walletsList.contents.walletsList[0] as WalletInfoRemote).bridgeUrl,
		};

		const universalLink = connector.connect(tonkeeperConnectionSource, {
			tonProof: authPayload.contents.tonProofPayload,
		});

		if (isMobile()) {
			openLink(addReturnStrategy(universalLink, 'none'), '_blank');
		} else {
			setModalUniversalLink(universalLink);
		}
	}, [walletsList, authPayload]);

	useEffect(() => {
		if (onWalletChange) {
			onWalletChange(wallet)
		}
	}, [wallet])

	return (
		<>
			<div className="auth-button" style={{ width: "100%" }}>
				{wallet ? (
					<Dropdown overlay={menu}>
						<Button shape="round" type="primary" size='large'>
							<Space>
								{address}
								<DownOutlined />
							</Space>
						</Button>
					</Dropdown>
				) : (
					<Button shape="round" type="primary" onClick={handleButtonClick}>
						Connect Wallet
					</Button>
				)}
			</div>
			<Modal
				title="Connect to Tonkeeper"
				open={!!modalUniversalLink}
				onOk={() => setModalUniversalLink('')}
				onCancel={() => setModalUniversalLink('')}
			>
				<QRCode
					size={256}
					style={{ height: '260px', maxWidth: '100%', width: '100%' }}
					value={modalUniversalLink}
					viewBox={`0 0 256 256`}
				/>
			</Modal>
		</>
	);
}
