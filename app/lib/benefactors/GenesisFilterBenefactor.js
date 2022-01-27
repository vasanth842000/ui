var GenesisFilter = require("chain/GenesisFilter");

onmessage = function(event) {
    try {
        console.log("GenesisFilterBenefactor start");
        var {account_keys, bloom_filter} = event.data;
        var genesis_filter = new GenesisFilter(bloom_filter);
        genesis_filter.filter(account_keys, status => {
            if (status.success) {
                postMessage({account_keys, status});
                console.log("GenesisFilterBenefactor done");
                return;
            }
            postMessage({status});
        });
    } catch (e) {
        console.error("GenesisFilterBenefactor", e);
    }
};
