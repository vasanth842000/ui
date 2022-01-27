import React from "react";
import ChainTypes from "./ChainTypes";
import BindToChainState from "./BindToChainState";
import LinkToAccountById from "./LinkToAccountById";

class LinkToBlockproducerById extends React.Component {
    static propTypes = {
        blockproducer: ChainTypes.ChainObject.isRequired
    };

    render() {
        let blockproducer_account = this.props.blockproducer.get(
            "blockproducer_account"
        );
        return <LinkToAccountById account={blockproducer_account} />;
    }
}
LinkToBlockproducerById = BindToChainState(LinkToBlockproducerById);

export default LinkToBlockproducerById;
