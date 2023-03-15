import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

const OFF_CHAIN_CONTENT_PREFIX = 0x01

export type RoyaltyParams = {
    royaltyFactor: number
    royaltyBase: number
    royaltyAddress: Address
}

export type NftCollectionConfig = {
    ownerAddress: Address,
    nextItemIndex: number
    collectionContent: string
    commonContent: string
    nftItemCode: Cell
    royaltyParams: RoyaltyParams
};

function bufferToChunks(buff: Buffer, chunkSize: number) {
    let chunks: Buffer[] = []
    while (buff.byteLength > 0) {
        chunks.push(buff.slice(0, chunkSize))
        buff = buff.slice(chunkSize)
    }
    return chunks
}

export function makeSnakeCell(data: Buffer) {
    let chunks = bufferToChunks(data, 127)
    let rootCell = beginCell()
    let curCell = rootCell

    for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i]

        curCell.storeBuffer(chunk)

        if (chunks[i+1]) {
            let nextCell = beginCell()
            curCell.storeRef(nextCell)
            curCell = nextCell
        }
    }

    return rootCell
}

export function encodeOffChainContent(content: string, hasPrefix = true) {
    let data = Buffer.from(content)

    if (hasPrefix) {
        let offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
        data = Buffer.concat([offChainPrefix, data])
    }

    return makeSnakeCell(data)
}

export function nftCollectionConfigToCell(data: NftCollectionConfig): Cell {
    let dataCell = beginCell()

    dataCell.storeAddress(data.ownerAddress)
    dataCell.storeUint(data.nextItemIndex, 64)

    let contentCell = beginCell()

    let collectionContent = encodeOffChainContent(data.collectionContent)

    let commonContent = beginCell()
    commonContent.storeBuffer(Buffer.from(data.commonContent))
    // commonContent.bits.writeString(data.commonContent)

    contentCell.storeRef(collectionContent)
    contentCell.storeRef(commonContent)
    dataCell.storeRef(contentCell)

    dataCell.storeRef(data.nftItemCode)

    let royaltyCell = beginCell()
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)
    dataCell.storeRef(royaltyCell)

    return dataCell.endCell()
}

export class NftCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftCollection(address);
    }

    static createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
        const data = nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NftCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
