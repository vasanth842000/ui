import {key} from "dxpertsjs";

onmessage = function(event) {
    try {
        console.log("AddressIndexBenefactor start");
        let {pubkeys, address_prefix} = event.data;
        let results = [];
        for (let pubkey of pubkeys) {
            results.push(key.addresses(pubkey, address_prefix));
        }
        postMessage(results);
        console.log("AddressIndexBenefactor done");
    } catch (e) {
        console.error("AddressIndexBenefactor", e);
    }
};
