import {getFaucet, getTestFaucet} from "../branding";

export const blockTradesAPIs = {
    BASE: "https://api.blocktrades.us/v2",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs",
    DEPOSIT_LIMIT: "/deposit-limits",
    ESTIMATE_OUTPUT: "/estimate-output-amount",
    ESTIMATE_INPUT: "/estimate-input-amount"
};

export const openledgerAPIs = {
    BASE: "https://ol-api1.gvxlive.io/api/v0/ol/support",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs",
    DEPOSIT_LIMIT: "/deposit-limits",
    ESTIMATE_OUTPUT: "/estimate-output-amount",
    ESTIMATE_INPUT: "/estimate-input-amount",
    RPC_URL: "https://gvxlive.io/api/"
};

export const rudexAPIs = {
    BASE: "https://gateway.rudex.org/api/rudex",
    COINS_LIST: "/coins",
    NEW_DEPOSIT_ADDRESS: "/simple-api/initiate-trade"
};

export const bitsparkAPIs = {
    BASE: "https://dex-api.bitspark.io/api/v1",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs",
    DEPOSIT_LIMIT: "/deposit-limits",
    ESTIMATE_OUTPUT: "/estimate-output-amount",
    ESTIMATE_INPUT: "/estimate-input-amount"
};

export const cryptoBridgeAPIs = {
    BASE: "https://api.crypto-bridge.org/api/v1",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/wallets",
    MARKETS: "/markets",
    TRADING_PAIRS: "/trading-pairs"
};

export const citadelAPIs = {
    BASE: "https://citadel.li/trade",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs",
    DEPOSIT_LIMIT: "/deposit-limits",
    ESTIMATE_OUTPUT: "/estimate-output-amount",
    ESTIMATE_INPUT: "/estimate-input-amount"
};

export const gdex2APIs = {
    BASE: "https://api.gdex.io/adjust",
    COINS_LIST: "/coins",
    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs"
};

// Legacy Deposit/Withdraw
export const gdexAPIs = {
    BASE: "https://api.gdex.io",
    ASSET_LIST: "/gateway/asset/assetList",
    ASSET_DETAIL: "/gateway/asset/assetDetail",
    GET_DEPOSIT_ADDRESS: "/gateway/address/getAddress",
    CHECK_WITHDRAY_ADDRESS: "/gateway/address/checkAddress",
    DEPOSIT_RECORD_LIST: "/gateway/deposit/recordList",
    DEPOSIT_RECORD_DETAIL: "/gateway/deposit/recordDetail",
    WITHDRAW_RECORD_LIST: "/gateway/withdraw/recordList",
    WITHDRAW_RECORD_DETAIL: "/gateway/withdraw/recordDetail",
    GET_USER_INFO: "/gateway/user/getUserInfo",
    USER_AGREEMENT: "/gateway/user/isAgree",
    WITHDRAW_RULE: "/gateway/withdraw/rule"
};

export const xdxpxAPIs = {
    BASE: "https://apis.xdxp.io/api/v1",
    COINS_LIST: "/coin"
};

export const nodeRegions = [
    // region of the node follows roughly https://en.wikipedia.org/wiki/Subregion#/media/File:United_Nations_geographical_subregions.png
    "Northern Europe",
    "Western Europe",
    "Southern Europe",
    "Eastern Europe",
    "Northern Asia",
    "Western Asia",
    "Southern Asia",
    "Eastern Asia",
    "Central Asia",
    "Southeastern Asia",
    "Australia and New Zealand",
    "Melanesia",
    "Polynesia",
    "Micronesia",
    "Northern Africa",
    "Western Africa",
    "Middle Africa",
    "Eastern Africa",
    "Southern Africa",
    "Northern America",
    "Central America",
    "Caribbean",
    "South America"
];

export const settingsAPIs = {
    // If you want a location to be translated, add the translation to settings in locale-xx.js
    // and use an object {translate: key} in WS_NODE_LIST
    DEFAULT_WS_NODE: "wss://fake.automatic-selection.com",
    WS_NODE_LIST: [
        {
            url: "wss://fake.automatic-selection.com",
            location: {translate: "settings.api_closest"}
        },
        {
            url: "ws://127.0.0.1:8090",
            location: "Locally hosted"
        },
        {
            url: "wss://node.dxperts.asia",
            region: "Southeastern Asia",
            country: "Singapore",
            location: "Singapore",
            operator: "Blockproducer: dxperts",
            contact: "telegram:csk"
        },
        {
            url: "ws://192.168.1.10:11011",
            region: "Southern Asia",
            country: "India",
            location: "Chennai",
            operator: "Blockproducer: dxperts",
            contact: "telegram:csk"
        },
        // Testnet
        {
            url: "wss://node.testnet.dxperts.eu",
            region: "TESTNET - Western Europe",
            country: "Germany",
            location: "Frankfurt",
            operator: "Dxperts Europe",
            contact: "telegram:xeroc"
        },
        {
            url: "wss://testnet.dex.trading/",
            region: "TESTNET - Western Europe",
            country: "France",
            location: "Paris",
            operator: "Blockproducer: zapata42-blockproducer",
            contact: "telegram:Zapata_42"
        },
        {
            url: "wss://testnet.xdxp.io/ws",
            region: "TESTNET - Europe",
            country: "Germany",
            location: "Nuremberg",
            operator: "Blockproducer: xdxpio-wallet",
            contact: "telegram: xdxpio"
        },
        {
            url: "wss://testnet.dxperts.im/ws",
            region: "Eastern Asia",
            country: "Japan",
            location: "Tokyo",
            operator: "Blockproducer: clone",
            contact: "telegram: yexiao"
        },
        {
            url: "wss://api-testnet.61dxp.com/ws",
            region: "Eastern Asia",
            country: "China",
            location: "Shandong",
            operator: "Blockproducer: liuye",
            contact: "email:work@domyself.me"
        }
    ],
    ES_WRAPPER_LIST: [
        {
            url: "https://api.dxperts.xyz/dxpexplorer",
            region: "Western Europe",
            country: "Germany",
            operator: "blocksights.info",
            contact: "dxperts:blocksights"
        }
    ],
    DEFAULT_FAUCET: getFaucet().url,
    TESTNET_FAUCET: getTestFaucet().url
};
