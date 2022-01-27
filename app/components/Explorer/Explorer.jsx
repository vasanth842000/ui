import React from "react";
import Blockproducers from "./Blockproducers";
import DxpcoreMembers from "./DxpcoreMembers";
import FeesContainer from "../Blockchain/FeesContainer";
import BlocksContainer from "./BlocksContainer";
import AssetsContainer from "./AssetsContainer";
import AccountsContainer from "./AccountsContainer";
import counterpart from "counterpart";
import MarketsContainer from "../Exchange/MarketsContainer";
import {Tabs} from "dxperts-ui-style-guide";

class Explorer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: "blocks",
                    link: "/explorer/blocks",
                    translate: "explorer.blocks.title",
                    content: BlocksContainer
                },
                {
                    name: "assets",
                    link: "/explorer/assets",
                    translate: "explorer.assets.title",
                    content: AssetsContainer
                },
                {
                    name: "accounts",
                    link: "/explorer/accounts",
                    translate: "explorer.accounts.title",
                    content: AccountsContainer
                },
                {
                    name: "blockproducers",
                    link: "/explorer/blockproducers",
                    translate: "explorer.blockproducers.title",
                    content: Blockproducers
                },
                {
                    name: "dxpcore_members",
                    link: "/explorer/dxpcore-members",
                    translate: "explorer.dxpcore_members.title",
                    content: DxpcoreMembers
                },
                {
                    name: "markets",
                    link: "/explorer/markets",
                    translate: "markets.title",
                    content: MarketsContainer
                },
                {
                    name: "fees",
                    link: "/explorer/fees",
                    translate: "fees.title",
                    content: FeesContainer
                }
            ]
        };
    }

    render() {
        const onChange = value => {
            this.props.history.push(value);
        };

        return (
            <Tabs
                activeKey={this.props.location.pathname}
                animated={false}
                style={{display: "table", height: "100%", width: "100%"}}
                onChange={onChange}
            >
                {this.state.tabs.map(tab => {
                    const TabContent = tab.content;

                    return (
                        <Tabs.TabPane
                            key={tab.link}
                            tab={counterpart.translate(tab.translate)}
                        >
                            <div className="padding">
                                <TabContent />
                            </div>
                        </Tabs.TabPane>
                    );
                })}
            </Tabs>
        );
    }
}

export default Explorer;
