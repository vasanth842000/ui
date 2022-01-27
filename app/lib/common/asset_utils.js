import assetConstants from "../chain/asset_constants";
import sanitize from "sanitize";
import utils from "./utils";

export default class AssetUtils {
    static getFlagBooleans(mask, isSmartToken = false) {
        let booleans = {
            charge_market_fee: false,
            white_list: false,
            override_authority: false,
            transfer_restricted: false,
            disable_force_settle: false,
            global_settle: false,
            disable_confidential: false,
            blockproducer_fed_asset: false,
            dxpcore_fed_asset: false
        };

        if (mask === "all") {
            for (let flag in booleans) {
                if (
                    !isSmartToken &&
                    assetConstants.uia_permission_mask.indexOf(flag) === -1
                ) {
                    delete booleans[flag];
                } else {
                    booleans[flag] = true;
                }
            }
            return booleans;
        }

        for (let flag in booleans) {
            if (
                !isSmartToken &&
                assetConstants.uia_permission_mask.indexOf(flag) === -1
            ) {
                delete booleans[flag];
            } else {
                if (mask & assetConstants.permission_flags[flag]) {
                    booleans[flag] = true;
                }
            }
        }

        return booleans;
    }

    static getFlags(flagBooleans) {
        let keys = Object.keys(assetConstants.permission_flags);

        let flags = 0;

        keys.forEach(key => {
            if (flagBooleans[key] && key !== "global_settle") {
                flags += assetConstants.permission_flags[key];
            }
        });

        return flags;
    }

    static getPermissions(flagBooleans, isSmartToken = false) {
        let permissions = isSmartToken
            ? Object.keys(assetConstants.permission_flags)
            : assetConstants.uia_permission_mask;
        let flags = 0;
        permissions.forEach(permission => {
            if (flagBooleans[permission] && permission !== "global_settle") {
                flags += assetConstants.permission_flags[permission];
            }
        });

        if (isSmartToken && flagBooleans["global_settle"]) {
            flags += assetConstants.permission_flags["global_settle"];
        }

        return flags;
    }

    static parseDescription(description) {
        let parsed;
        description = utils.sanitize(description);
        try {
            parsed = JSON.parse(description);
        } catch (error) {}
        for (let key in parsed) {
            parsed[key] = utils.sanitize(parsed[key]);
        }
        return parsed ? parsed : {main: description};
    }

    static extractRawFeedPrice(asset) {
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
        if (!!asset.smarttoken) {
            return asset.smarttoken.current_feed.settlement_price;
        }
        if (!!asset.current_feed) {
            return asset.current_feed.settlement_price;
        }
        if (!!asset.settlement_price) {
            return asset.settlement_price;
        }
        if (!!asset.get("smarttoken")) {
            return asset.getIn([
                "smarttoken",
                "current_feed",
                "settlement_price"
            ]);
        }
        if (!!asset.get("settlement_price")) {
            return asset.getIn(["settlement_price"]);
        }
        if (!!asset.get("current_feed")) {
            return asset.getIn(["current_feed", "settlement_price"]);
        }
        throw "Feed price not found!";
    }
}