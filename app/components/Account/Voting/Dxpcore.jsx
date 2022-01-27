import React, {Component} from "react";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import JoinDxpcoreModal from "../../Modal/JoinDxpcoreModal";
import VotingAccountsList from "../VotingAccountsList";
import cnames from "classnames";
import {Input, Icon as AntIcon, Button} from "dxperts-ui-style-guide";
import SearchInput from "../../Utility/SearchInput";

export default class Dxpcore extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCreateDxpcoreModal: false
        };
    }

    render() {
        const showDxpcoreModal = () => {
            console.log("show dxpcore modal");
            this.setState({
                showCreateDxpcoreModal: !this.state.showCreateDxpcoreModal
            });
        };

        const onFilterChange = this.props.onFilterChange;
        const validateAccountHandler = this.props.validateAccountHandler;
        const addDxpcoreHandler = this.props.addDxpcoreHandler;
        const removeDxpcoreHandler = this.props.removeDxpcoreHandler;

        const {showCreateDxpcoreModal} = this.state;
        const {
            all_dxpcore,
            proxy_dxpcore,
            dxpcore,
            proxy_account_id,
            hasProxy,
            globalObject,
            filterSearch,
            account
        } = this.props;
        return (
            <div>
                <div className="header-selector">
                    <div style={{float: "right"}}>
                        <Button onClick={showDxpcoreModal}>
                            <Translate content="account.votes.join_dxpcore" />
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
                <div className={cnames("content-block")}>
                    <VotingAccountsList
                        type="dxpcore"
                        label="account.votes.add_dxpcore_label"
                        items={all_dxpcore}
                        validateAccount={validateAccountHandler}
                        onAddItem={addDxpcoreHandler}
                        onRemoveItem={removeDxpcoreHandler}
                        tabIndex={hasProxy ? -1 : 3}
                        supported={hasProxy ? proxy_dxpcore : dxpcore}
                        active={globalObject.get("active_dxpcore_members")}
                        proxy={proxy_account_id}
                        filterSearch={filterSearch}
                    />
                </div>
                <JoinDxpcoreModal
                    visible={showCreateDxpcoreModal}
                    account={account}
                    hideModal={showDxpcoreModal}
                />
            </div>
        );
    }
}
