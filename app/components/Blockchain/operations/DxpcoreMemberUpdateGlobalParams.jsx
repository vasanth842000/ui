import React from "react";
import TranslateWithLinks from "../../Utility/TranslateWithLinks";

export const DxpcoreMemberUpdateGlobalParams = ({fromComponent}) => {
    return (
        <span>
            <TranslateWithLinks
                string={
                    fromComponent === "proposed_operation"
                        ? "proposal.dxpcore_member_update_global_parameters"
                        : "operation.dxpcore_member_update_global_parameters"
                }
                keys={[
                    {
                        type: "account",
                        value: "1.2.0",
                        arg: "account"
                    }
                ]}
            />
        </span>
    );
};
