import alt from "alt-instance";
import {Apis} from "dxpertsjs-ws";
import utils from "common/utils";
import WalletApi from "api/WalletApi";
import WalletDb from "stores/WalletDb";
import {ChainStore} from "dxpertsjs";
import big from "bignumber.js";
import {gatewayPrefixes} from "common/gateways";
import {price} from "dxpertsjs/es/serializer/src/operations";
let inProgress = {};

class AssetActions {
    publishFeed({publisher, asset_id, mcr, mssr, feedPrice, cer}) {
        let tr = WalletApi.new_transaction();
        /**
         * The naming convention is confusing!
         *
         * dxperts-core knows only settlement_price, which is the feed price as known from UI!
         *
         * UI definition:
         *  - Feed Price: Blockproducer fed price, given by backend as settlement_price
         *  - Settlement Price: feed price * force settlement offset factor
         *
         */
        tr.add_type_operation("asset_publish_feed", {
            publisher,
            asset_id,
            feed: {
                settlement_price: feedPrice.toObject(),
                maintenance_collateral_ratio: mcr,
                maximum_short_squeeze_ratio: mssr,
                core_exchange_rate: cer.toObject()
            }
        });

        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- fundPool error ----->", error);
                    dispatch(false);
                });
        };
    }

    fundPool(account_id, core, asset, amount) {
        let tr = WalletApi.new_transaction();
        let precision = utils.get_token_precision(core.get("precision"));
        tr.add_type_operation("asset_fund_fee_pool", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            from_account: account_id,
            asset_id: asset.get("id"),
            amount: amount * precision
        });

        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- fundPool error ----->", error);
                    dispatch(false);
                });
        };
    }

    claimPool(asset, amount) {
        let tr = WalletApi.new_transaction();
        tr.add_type_operation("asset_claim_pool", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            issuer: asset.get("issuer"),
            asset_id: asset.get("id"),
            amount_to_claim: amount.toObject()
        });
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- claimPool error ----->", error);
                    dispatch(false);
                });
        };
    }

    bidCollateral(account_id, core, asset, coll, debt) {
        let core_precision = utils.get_token_precision(core.get("precision"));
        let asset_precision = utils.get_token_precision(asset.get("precision"));

        var tr = WalletApi.new_transaction();
        tr.add_type_operation("bid_collateral", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            bidder: account_id,
            additional_collateral: {
                amount: coll * core_precision,
                asset_id: core.get("id")
            },
            debt_covered: {
                amount: debt * asset_precision,
                asset_id: asset.get("id")
            },
            extensions: []
        });

        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- collateralBid error ----->", error);
                    dispatch(false);
                });
        };
    }

    updateOwner(asset, new_issuer_id) {
        let tr = WalletApi.new_transaction();
        tr.add_type_operation("asset_update_issuer", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            issuer: asset.issuer,
            asset_to_update: asset.id,
            new_issuer: new_issuer_id
        });
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- updateOwner error ----->", error);
                    dispatch(false);
                });
        };
    }

    updateFeedProducers(account, asset, producers) {
        let tr = WalletApi.new_transaction();
        tr.add_type_operation("asset_update_feed_producers", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            issuer: account,
            asset_to_update: asset.get("id"),
            new_feed_producers: producers
        });

        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log(
                        "----- updateFeedProducers error ----->",
                        error
                    );
                    dispatch(false);
                });
        };
    }

    claimPoolFees(account_id, asset, amount) {
        let tr = WalletApi.new_transaction();

        tr.add_type_operation("asset_claim_fees", {
            fee: {
                amount: 0,
                asset_id: 0
            },
            issuer: account_id,
            amount_to_claim: {
                asset_id: asset.get("id"),
                amount: amount.getAmount()
            }
        });
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- claimFees error ----->", error);
                    dispatch(false);
                });
        };
    }

    assetGlobalSettle(asset, account_id, price) {
        let tr = WalletApi.new_transaction();

        tr.add_type_operation("asset_global_settle", {
            fee: {
                amount: 0,
                asset_id: 0
            },
            issuer: account_id,
            asset_to_settle: asset.id,
            settle_price: price
        });
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                })
                .catch(error => {
                    console.log(
                        "[AssetActions.js:223] ----- assetGlobalSettle error ----->",
                        error
                    );
                    dispatch(false);
                });
        };
    }

    createAsset(
        account_id,
        createObject,
        flags,
        permissions,
        cer,
        isSmartToken,
        is_prediction_market,
        smarttoken_opts,
        description
    ) {
        // Create asset action here...
        console.log(
            "create asset:",
            createObject,
            "flags:",
            flags,
            "isSmartToken:",
            isSmartToken,
            "smarttoken_opts:",
            smarttoken_opts
        );
        let tr = WalletApi.new_transaction();
        let precision = utils.get_token_precision(createObject.precision);

        big.config({DECIMAL_PLACES: createObject.precision});
        let max_supply = new big(createObject.max_supply)
            .times(precision)
            .toString();
        let max_market_fee = new big(createObject.max_market_fee || 0)
            .times(precision)
            .toString();

        let corePrecision = utils.get_token_precision(
            ChainStore.getAsset(cer.base.asset_id).get("precision")
        );

        let operationJSON = {
            fee: {
                amount: 0,
                asset_id: 0
            },
            issuer: account_id,
            symbol: createObject.symbol,
            precision: parseInt(createObject.precision, 10),
            common_options: {
                max_supply: max_supply,
                market_fee_percent: createObject.market_fee_percent * 100 || 0,
                max_market_fee: max_market_fee,
                issuer_permissions: permissions,
                flags: flags,
                core_exchange_rate: {
                    base: {
                        amount: cer.base.amount * corePrecision,
                        asset_id: cer.base.asset_id
                    },
                    quote: {
                        amount: cer.quote.amount * precision,
                        asset_id: "1.3.1"
                    }
                },
                whitelist_authorities: [],
                blacklist_authorities: [],
                whitelist_markets: [],
                blacklist_markets: [],
                description: description,
                extensions: {
                    reward_percent: createObject.reward_percent * 100 || 0,
                    whitelist_market_fee_sharing: []
                }
            },
            is_prediction_market: is_prediction_market,
            extensions: null
        };

        if (isSmartToken) {
            operationJSON.smarttoken_opts = smarttoken_opts;
        }

        tr.add_type_operation("asset_create", operationJSON);
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(result => {
                    // console.log("asset create result:", result);
                    // this.dispatch(account_id);
                    dispatch(true);
                })
                .catch(error => {
                    console.log("----- createAsset error ----->", error);
                    dispatch(false);
                });
        };
    }

    updateAsset(
        issuer,
        new_issuer,
        update,
        core_exchange_rate,
        asset,
        flags,
        permissions,
        isSmartToken,
        smarttoken_opts,
        original_smarttoken_opts,
        description,
        auths,
        feedProducers,
        originalFeedProducers,
        assetChanged
    ) {
        // Create asset action here...
        let tr = WalletApi.new_transaction();
        if (assetChanged) {
            let quotePrecision = utils.get_token_precision(
                asset.get("precision")
            );

            big.config({DECIMAL_PLACES: asset.get("precision")});
            let max_supply = new big(update.max_supply)
                .times(quotePrecision)
                .toString();
            let max_market_fee = new big(update.max_market_fee || 0)
                .times(quotePrecision)
                .toString();

            let cr_quote_asset = ChainStore.getAsset(
                core_exchange_rate.quote.asset_id
            );
            let cr_quote_precision = utils.get_token_precision(
                cr_quote_asset.get("precision")
            );
            let cr_base_asset = ChainStore.getAsset(
                core_exchange_rate.base.asset_id
            );
            let cr_base_precision = utils.get_token_precision(
                cr_base_asset.get("precision")
            );

            let cr_quote_amount = new big(core_exchange_rate.quote.amount)
                .times(cr_quote_precision)
                .toString();
            let cr_base_amount = new big(core_exchange_rate.base.amount)
                .times(cr_base_precision)
                .toString();

            let extensions = asset.getIn(["options", "extensions"]).toJS();
            if (update.reward_percent !== undefined) {
                extensions.reward_percent = update.reward_percent * 100;
            }
            if (auths.whitelist_market_fee_sharing) {
                extensions.whitelist_market_fee_sharing = auths.whitelist_market_fee_sharing.toJS();
            }

            let updateObject = {
                fee: {
                    amount: 0,
                    asset_id: 0
                },
                asset_to_update: asset.get("id"),
                extensions: asset.get("extensions"),
                issuer: issuer,
                new_issuer: new_issuer,
                new_options: {
                    max_supply: max_supply,
                    max_market_fee: max_market_fee,
                    market_fee_percent: update.market_fee_percent * 100,
                    description: description,
                    issuer_permissions: permissions,
                    flags: flags,
                    whitelist_authorities: auths.whitelist_authorities.toJS(),
                    blacklist_authorities: auths.blacklist_authorities.toJS(),
                    whitelist_markets: auths.whitelist_markets.toJS(),
                    blacklist_markets: auths.blacklist_markets.toJS(),
                    extensions: extensions,
                    core_exchange_rate: {
                        quote: {
                            amount: cr_quote_amount,
                            asset_id: core_exchange_rate.quote.asset_id
                        },
                        base: {
                            amount: cr_base_amount,
                            asset_id: core_exchange_rate.base.asset_id
                        }
                    }
                }
            };

            if (issuer === new_issuer || !new_issuer) {
                delete updateObject.new_issuer;
            }
            tr.add_type_operation("asset_update", updateObject);
        }

        console.log(
            "smarttoken_opts:",
            smarttoken_opts,
            "original_smarttoken_opts:",
            original_smarttoken_opts
        );
        if (
            isSmartToken &&
            (smarttoken_opts.feed_lifetime_sec !==
                original_smarttoken_opts.feed_lifetime_sec ||
                smarttoken_opts.minimum_feeds !==
                    original_smarttoken_opts.minimum_feeds ||
                smarttoken_opts.force_settlement_delay_sec !==
                    original_smarttoken_opts.force_settlement_delay_sec ||
                smarttoken_opts.force_settlement_offset_percent !==
                    original_smarttoken_opts.force_settlement_offset_percent ||
                smarttoken_opts.maximum_force_settlement_volume !==
                    original_smarttoken_opts.maximum_force_settlement_volume ||
                smarttoken_opts.short_backing_asset !==
                    original_smarttoken_opts.short_backing_asset)
        ) {
            let smartTokenUpdateObject = {
                fee: {
                    amount: 0,
                    asset_id: 0
                },
                asset_to_update: asset.get("id"),
                issuer: issuer,
                new_options: smarttoken_opts
            };

            tr.add_type_operation(
                "asset_update_smarttoken",
                smartTokenUpdateObject
            );
        }

        console.log(
            "feedProducers:",
            feedProducers,
            "originalFeedProducers:",
            originalFeedProducers
        );
        if (
            isSmartToken &&
            !utils.are_equal_shallow(feedProducers, originalFeedProducers)
        ) {
            tr.add_type_operation("asset_update_feed_producers", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                issuer: issuer,
                asset_to_update: asset.get("id"),
                new_feed_producers: feedProducers
            });
        }

        return WalletDb.process_transaction(tr, null, true)
            .then(result => {
                console.log("asset create result:", result);
                // this.dispatch(account_id);
                return true;
            })
            .catch(error => {
                console.log("----- updateAsset error ----->", error);
                return false;
            });
    }

    async loadAssets() {
        let start = "A";
        const count = 10;

        let assets = [];
        let newAssets = null;
        while (
            assets.length == 0 ||
            newAssets == null ||
            newAssets.length > 0
        ) {
            newAssets = await Apis.instance()
                .db_api()
                .exec("list_tokens", [start, count]);
            assets = assets.concat(newAssets);
            start = assets[assets.length - 1].symbol + ".";
        }
        console.log("Assets loaded: ", assets.length);
    }

    getAssetList(start, count, includeGateways = false) {
        let id = start + "_" + count;
        return dispatch => {
            if (!inProgress[id]) {
                let assets;
                inProgress[id] = true;
                dispatch({loading: true});

                assets = Apis.instance()
                    .db_api()
                    .exec("list_tokens", [start, count])
                    .then(assets => {
                        let smartTokenIDS = [];
                        let dynamicIDS = [];

                        assets.forEach(asset => {
                            ChainStore._updateObject(asset, false);
                            dynamicIDS.push(asset.dynamic_asset_data_id);

                            if (asset.smarttoken_data_id) {
                                smartTokenIDS.push(asset.smarttoken_data_id);
                            }
                        });

                        let dynamicPromise = Apis.instance()
                            .db_api()
                            .exec("get_objects", [dynamicIDS]);

                        let smartTokenPromise =
                            smartTokenIDS.length > 0
                                ? Apis.instance()
                                      .db_api()
                                      .exec("get_objects", [smartTokenIDS])
                                : null;

                        Promise.all([dynamicPromise, smartTokenPromise]).then(
                            results => {
                                delete inProgress[id];
                                dispatch({
                                    assets: assets,
                                    dynamic: results[0],
                                    smarttoken_data: results[1],
                                    loading: false
                                });
                                return assets && assets.length;
                            }
                        );
                    })
                    .catch(error => {
                        console.log(
                            "Error in AssetActions.getAssetList: ",
                            error
                        );
                        dispatch({loading: false});
                        delete inProgress[id];
                    });

                // Fetch next 10 assets for each gateAsset on request
                if (includeGateways) {
                    gatewayPrefixes.forEach(a => {
                        this.getAssetList(a + "." + start, 10);
                    });
                }

                return assets;
            }
        };
    }

    lookupAsset(symbol, searchID) {
        let asset = ChainStore.getAsset(symbol);

        if (asset) {
            return {
                assets: [asset],
                searchID: searchID,
                symbol: symbol
            };
        } else {
            return dispatch => {
                // Hack to retry once until we replace this method with a new api call to lookup multiple assets
                setTimeout(() => {
                    let asset = ChainStore.getAsset(symbol);
                    if (asset) {
                        dispatch({
                            assets: [asset],
                            searchID: searchID,
                            symbol: symbol
                        });
                    }
                }, 200);
            };
        }
    }

    reserveAsset(amount, assetId, payer) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("asset_reserve", {
            fee: {
                amount: 0,
                asset_id: 0
            },
            amount_to_reserve: {
                amount: amount,
                asset_id: assetId
            },
            payer,
            extensions: []
        });
        return dispatch => {
            return WalletDb.process_transaction(tr, null, true)
                .then(() => {
                    dispatch(true);
                    return true;
                })
                .catch(error => {
                    dispatch(false);
                    console.log("----- reserveAsset error ----->", error);
                    return false;
                });
        };
    }
}

export default alt.createActions(AssetActions);
