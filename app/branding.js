import {Apis, ChainConfig} from "dxpertsjs-ws";
import chainIds from "chain/chainIds";

/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Determine if we are running on testnet or mainnet
 * @private
 */
function _isTestnet() {
    const testnet = chainIds.TEST_NET;
    const mainnet = chainIds.MAIN_NET;
    ChainConfig.setPrefix("DXP");
    // console.log(process.env.REACT_APP_MAIN_NET_CHAIN_ID);
    // console.log(process.env.REACT_APP_TEST_NET_CHAIN_ID);
    // treat every other chain as testnet
    return Apis.instance().chain_id !== mainnet;
}

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "Dxperts";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "https://wallet.dxptoken.com";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url:
            process.env.REACT_APP_MAIN_NET_FAUCET_URL ||
            "https://faucet.dxpl.org", // 2017-12-infrastructure worker proposal
        show: true,
        editable: false,
        referrer: "sponser.dxperts.network"
    };
}

export function getTestFaucet() {
    // fixme should be solved by introducing _isTestnet into getFaucet and fixing the mess in the Settings when fetching faucet address
    return {
        url:
            process.env.REACT_APP_TEST_NET_FAUCET_URL ||
            "https://faucet.dxpl.org", // operated as a contribution by Dxperts community
        show: true,
        editable: false
    };
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
export function getLogo() {
    return require("assets/logo-ico-blue.png");
}

/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
    // possible ["darkTheme", "lightTheme", "midnightTheme"]
    return "lightTheme";
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
    // possible: one of "password", "wallet"
    return "password";
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits() {
    if (_isTestnet()) {
        return ["TEST"];
    }
    return ["DXP", "USD", "CNY", "BTC", "EUR", "GBP"];
}

export function getDefaultMarket() {
    if (_isTestnet()) {
        return "USD_TEST";
    }
    return "DXP_CNY";
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */
export function getMyMarketsBases() {
    if (_isTestnet()) {
        return ["TEST"];
    }
    return ["DXP", "DSTAR", "DUSD"];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes() {
    if (_isTestnet()) {
        return ["TEST"];
    }
    let tokens = {
        nativeTokens: ["BTC", "DXP", "CNY", "EUR", "RUBLE", "SILVER", "USD"],
        otherTokens: ["CVCOIN", "HERO", "OCT", "HERTZ", "YOYOW"]
    };

    let allTokens = [];
    for (let type in tokens) {
        allTokens = allTokens.concat(tokens[type]);
    }
    return allTokens;
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
    if (_isTestnet()) {
        return [["USD", "TEST"]];
    }
    return [
        ["DXP", "D.USD"],
        ["DXP", "D.STAR"],
        ["DXP", "D.PAGE"],
        ["DXP", "D.COMP"],
        ["DXP", "D.PROJ"],
        ["DXP", "D.GRUP"],
        ["DXP", "D.JOBS"],
        ["DXP", "D.NEWS"],
        ["DXP", "D.POLL"],
        ["DXP", "D.EVNT"],
        ["DXP", "D.RESO"],
        ["DXP", "D.ANNT"],
        ["DXP", "D.ADVT"],
        ["DXP", "D.SRVC"],
        ["DXP", "D.USDT"],
        ["DXP", "D.BTC"],
        ["DXP", "D.ETH"],
        ["DXP", "D.BNB"],
        ["DXP", "D.DOT"],
        ["DXP", "D.ADA"],
        ["DXP", "D.SOL"],
        ["DXP", "D.EOS"],
        ["DXP", "D.TRX"],
        ["DXP", "D.XRP"],
        ["DXP", "D.XLM"],
        ["DXP", "D.PNT"],
        ["DXP", "FSHO"],
        ["DXP", "KNK"],
        ["DXP", "JNM"],
        ["DXP", "DXK"],
        ["D.STAR", "D.USD"],
        ["D.STAR", "D.PAGE"],
        ["D.STAR", "D.COMP"],
        ["D.STAR", "D.PROJ"],
        ["D.STAR", "D.GRUP"],
        ["D.STAR", "D.JOBS"],
        ["D.STAR", "D.NEWS"],
        ["D.STAR", "D.POLL"],
        ["D.STAR", "D.EVNT"],
        ["D.STAR", "D.RESO"],
        ["D.STAR", "D.ANNT"],
        ["D.STAR", "D.ADVT"],
        ["D.STAR", "D.SRVC"],
        ["D.STAR", "D.USDT"],
        ["D.STAR", "D.BTC"],
        ["D.STAR", "D.ETH"],
        ["D.STAR", "D.BNB"],
        ["D.STAR", "D.DOT"],
        ["D.STAR", "D.ADA"],
        ["D.STAR", "D.SOL"],
        ["D.STAR", "D.EOS"],
        ["D.STAR", "D.TRX"],
        ["D.STAR", "D.XRP"],
        ["D.STAR", "D.XLM"],
        ["D.STAR", "D.PNT"],
        ["D.STAR", "FSHO"],
        ["D.STAR", "KNK"],
        ["D.STAR", "JNM"],
        ["D.STAR", "DXK"],
        ["D.USD", "DXP"],
        ["D.USD", "D.STAR"],
        ["D.USD", "D.PAGE"],
        ["D.USD", "D.COMP"],
        ["D.USD", "D.PROJ"],
        ["D.USD", "D.GRUP"],
        ["D.USD", "D.JOBS"],
        ["D.USD", "D.NEWS"],
        ["D.USD", "D.POLL"],
        ["D.USD", "D.EVNT"],
        ["D.USD", "D.RESO"],
        ["D.USD", "D.ANNT"],
        ["D.USD", "D.ADVT"],
        ["D.USD", "D.SRVC"],
        ["D.USD", "D.USDT"],
        ["D.USD", "D.BTC"],
        ["D.USD", "D.ETH"],
        ["D.USD", "D.BNB"],
        ["D.USD", "D.DOT"],
        ["D.USD", "D.ADA"],
        ["D.USD", "D.SOL"],
        ["D.USD", "D.EOS"],
        ["D.USD", "D.TRX"],
        ["D.USD", "D.XRP"],
        ["D.USD", "D.XLM"],
        ["D.USD", "D.PNT"],
        ["D.USD", "FSHO"],
        ["D.USD", "KNK"],
        ["D.USD", "JNM"],
        ["D.USD", "DXK"]
    ].filter(a => {
        if (!quotes.length) return true;
        return quotes.indexOf(a[0]) !== -1;
    });
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
    if (_isTestnet()) {
        return [];
    }
    return ["D."];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for smartassets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "OPEN.", "bit"
    return [];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    const allowedGateways = [
        "GVX",
        "", // keep to display the warning icon, permanently disabled in gateways.js
        "",
        "",
        "",
        "",
        "", // keep to display the warning icon, permanently disabled in gateways.js
        "" // keep to display the warning icon, permanently disabled in gateways.js
    ];
    if (!gateway) {
        // answers the question: are any allowed?
        return allowedGateways.length > 0;
    }
    return allowedGateways.indexOf(gateway) >= 0;
}

export function getSupportedLanguages() {
    // not yet supported
}

export function getAllowedLogins() {
    // possible: list containing any combination of ["password", "wallet"]
    return ["password", "wallet"];
}

export function getConfigurationAsset() {
    let assetSymbol = null;
    if (_isTestnet()) {
        assetSymbol = "NOTIFICATIONS";
    } else {
        assetSymbol = "TEST";
    }
    // explanation will be parsed out of the asset description (via split)
    return {
        symbol: assetSymbol,
        explanation:
            "This asset is used for decentralized configuration of the Dxperts UI placed under dxperts.org."
    };
}

export function getSteemNewsTag() {
    return null;
}
