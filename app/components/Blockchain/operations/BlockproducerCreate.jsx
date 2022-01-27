import React from "react";
import Translate from "react-translate-component";
import TranslateWithLinks from "../../Utility/TranslateWithLinks";

export const BlockproducerCreate = ({op, linkToAccount, fromComponent}) => {
    if (fromComponent === "proposed_operation") {
        return (
            <span>
                <Translate
                    component="span"
                    content="proposal.blockproducer_create"
                />
                &nbsp;
                {linkToAccount(op[1].blockproducer_account)}
            </span>
        );
    } else {
        return (
            <span>
                <TranslateWithLinks
                    string="operation.blockproducer_create"
                    keys={[
                        {
                            type: "account",
                            value: op[1].blockproducer_account,
                            arg: "account"
                        }
                    ]}
                />
            </span>
        );
    }
};
