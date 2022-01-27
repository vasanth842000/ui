import React, {Component} from "react";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import VotingAccountsList from "../VotingAccountsList";
import cnames from "classnames";
import {Input, Icon as AntIcon, Button} from "dxperts-ui-style-guide";
import JoinBlockproducerModal from "../../Modal/JoinBlockproducersModal";
import SearchInput from "../../Utility/SearchInput";

export default class Blockproducers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCreateBlockproducerModal: false
        };
    }

    render() {
        const showBlockproducerModal = () => {
            this.setState({
                showCreateBlockproducerModal: !this.state
                    .showCreateBlockproducerModal
            });
        };

        const onFilterChange = this.props.onFilterChange;
        const validateAccountHandler = this.props.validateAccountHandler;
        const addBlockproducerHandler = this.props.addBlockproducerHandler;
        const removeBlockproducerHandler = this.props
            .removeBlockproducerHandler;

        const {showCreateBlockproducerModal} = this.state;
        const {
            all_blockproducers,
            proxy_blockproducers,
            blockproducers,
            proxy_account_id,
            hasProxy,
            globalObject,
            filterSearch,
            account
        } = this.props;
        return (
            <div>
                <div className={cnames("content-block")}>
                    <div className="header-selector">
                        <div style={{float: "right"}}>
                            <Button onClick={showBlockproducerModal}>
                                <Translate content="account.votes.join_blockproducers" />
                            </Button>
                        </div>

                        <div className="selector inline-block">
                            <SearchInput
                                placeholder={counterpart.translate(
                                    "explorer.blockproducers.filter_by_name"
                                )}
                                value={filterSearch}
                                onChange={onFilterChange}
                            />
                        </div>
                    </div>
                    <VotingAccountsList
                        type="blockproducer"
                        label="account.votes.add_blockproducer_label"
                        items={all_blockproducers}
                        validateAccount={validateAccountHandler}
                        onAddItem={addBlockproducerHandler}
                        onRemoveItem={removeBlockproducerHandler}
                        tabIndex={hasProxy ? -1 : 2}
                        supported={
                            hasProxy ? proxy_blockproducers : blockproducers
                        }
                        active={globalObject.get("active_blockproducers")}
                        proxy={proxy_account_id}
                        filterSearch={filterSearch}
                    />
                </div>
                <JoinBlockproducerModal
                    visible={showCreateBlockproducerModal}
                    account={account}
                    hideModal={showBlockproducerModal}
                />
            </div>
        );
    }
}
