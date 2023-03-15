import { TonProofItemReplySuccess } from '@tonconnect/protocol';
import { Account } from '@tonconnect/sdk';
import axios from 'axios';
import { connector } from './connector';
import './patch-local-storage-for-github-pages';

const urlParams = new URLSearchParams(window.location.search);

class TonProofDemoApiService {
	localStorageKey = process.env.REACT_APP_LOCAL_STORAGE_KEY!;

	host = process.env.REACT_APP_TON_PROOF_HOST!;

	accessToken: string | null = null;

	constructor() {
		this.accessToken = localStorage.getItem(this.localStorageKey);

		connector.onStatusChange((wallet) => {
			if (!wallet) {
				this.reset();
				return;
			}

			const tonProof = wallet.connectItems?.tonProof;

			if (tonProof) {
				if ('proof' in tonProof) {
					this.checkProof(tonProof.proof, wallet.account);
					return;
				}

				console.error(tonProof.error);
			}

			if (!this.accessToken) {
				connector.disconnect();
			}
		});
	}

	async getMyWallet() {
		try {
			// console.log(this.accessToken)
			if (!this.accessToken) {
				return null;
			}
	
			const response = await axios.get(`${this.host}/wallet/me`, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				}
			})
	
			return response.data;
		} catch (err) {
			console.error(err)
			localStorage.removeItem(this.localStorageKey)
			return null;
		}
	}

	async getTelegramGroup(groupId: string) {
		try {
			// console.log(this.accessToken)
			if (!this.accessToken) {
				window.location.href = "/connect?redirect_group_id=" + urlParams.get('group_id')
				return null;
			}
	
			const response = await axios.get(`${this.host}/telegram/groups/${groupId}`, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				}
			})
	
			return response.data;
		} catch (err) {
			console.error(err)
			// localStorage.removeItem(this.localStorageKey)
			return null;
		}
	}

	async verifyTwitterFollow(groupId: string) {
		try {
			// console.log(this.accessToken)
			if (!this.accessToken) {
				window.location.href = "/connect?redirect_group_id=" + urlParams.get('group_id')
				return null;
			}
	
			const response = await axios.get(`${this.host}/twitter/follow/${groupId}`, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				}
			})
	
			return response.data;
		} catch (err) {
			console.error(err)
			// localStorage.removeItem(this.localStorageKey)
			return null;
		}
	}

	async generatePayload() {
		const response = await (
			await fetch(`${this.host}/ton-proof/generatePayload`, {
				method: 'POST',
			})
		).json();

		return response.payload as string;
	}

	async checkProof(proof: TonProofItemReplySuccess['proof'], account: Account) {
		try {
			const reqBody = {
				address: account.address,
				network: account.chain,
				proof: {
					...proof,
					state_init: account.walletStateInit,
				},
			};

			const response = await (
				await fetch(`${this.host}/ton-proof/checkProof`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(reqBody),
				})
			).json();

			console.log(response);

			if (response?.token) {
				localStorage.setItem(this.localStorageKey, response.token);
				this.accessToken = response.token;
			}

			window.location.reload()
		} catch (e) {
			console.log('checkProof error:', e);
		}
	}

	async getAccountInfo(account: Account) {
		console.log(this.accessToken);

		const response = await (
			await fetch(`${this.host}/dapp/getAccountInfo?network=${account.chain}`, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
			})
		).json();

		return response as {};
	}

	reset() {
		this.accessToken = null;
		localStorage.removeItem(this.localStorageKey);
	}
}

export const TonProofDemoApi = new TonProofDemoApiService();
