export default {
    MAIN_NET:
        process.env.REACT_APP_MAIN_NET_CHAIN_ID ||
        "32cf770e75d6d66a45c27ec039e69508ba2c43943a457cf629ace9c2d820e941",
    TEST_NET:
        process.env.REACT_APP_TEST_NET_CHAIN_ID ||
        "39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447"
};
