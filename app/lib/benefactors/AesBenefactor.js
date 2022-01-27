require("babel-polyfill");
import {Aes} from "dxpertsjs";

onmessage = function(event) {
    try {
        console.log("AesBenefactor start");
        let {private_plainhex_array, iv, key} = event.data;
        let aes = new Aes(iv, key);
        let private_cipherhex_array = [];
        for (let private_plainhex of private_plainhex_array) {
            let private_cipherhex = aes.encryptHex(private_plainhex);
            private_cipherhex_array.push(private_cipherhex);
        }
        postMessage(private_cipherhex_array);
        console.log("AesBenefactor done");
    } catch (e) {
        console.error("AesBenefactor", e);
    }
};
