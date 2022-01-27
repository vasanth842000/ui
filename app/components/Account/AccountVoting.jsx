import React from "react";
import {withRouter} from "react-router";
import Immutable from "immutable";
import Translate from "react-translate-component";
import accountUtils from "common/account_utils";
import {ChainStore, FetchChainObjects} from "dxpertsjs";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import {Link} from "react-router-dom";
import ApplicationApi from "api/ApplicationApi";
import AccountSelector from "./AccountSelector";
import Icon from "../Icon/Icon";
import counterpart from "counterpart";
import SettingsStore from "stores/SettingsStore";
import {Switch, Tooltip, Button, Tabs} from "dxperts-ui-style-guide";
import AccountStore from "stores/AccountStore";
import Blockproducers from "./Voting/Blockproducers";
import Dxpcore from "./Voting/Dxpcore";
import Benefactors from "./Voting/Benefactors";
import CreateLockModal from "../Modal/CreateLockModal";

const BLOCKPRODUCERS_KEY = "blockproducers";
const DXPCORE_KEY = "dxpcore";

class AccountVoting extends React.Component {
    static propTypes = {
        initialBudget: ChainTypes.ChainObject.isRequired,
        globalObject: ChainTypes.ChainObject.isRequired,
        proxy: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        globalObject: "2.0.0"
    };

    constructor(props) {
        super(props);
        const proxyId = props.proxy.get("id");
        const proxyName = props.proxy.get("name");
        const accountName =
            typeof props.account === "string"
                ? props.account
                : props.account.get("name");
        this.state = {
            proxy_account_id: proxyId === "1.2.5" ? "" : proxyId, //"1.2.16",
            prev_proxy_account_id: proxyId === "1.2.5" ? "" : proxyId,
            current_proxy_input: proxyId === "1.2.5" ? "" : proxyName,
            blockproducers: null,
            dxpcore: null,
            vote_ids: Immutable.Set(),
            proxy_vote_ids: Immutable.Set(),
            lastBudgetObject: props.initialBudget.get("id"),
            all_blockproducers: Immutable.List(),
            all_dxpcore: Immutable.List(),
            hideLegacyProposals: true,
            filterSearch: "",
            isCreateLockModalVisible: false,
            isCreateLockModalVisibleBefore: false,
            tabs: [
                {
                    name: "blockproducers",
                    link: "/account/" + accountName + "/voting/blockproducers",
                    translate: "explorer.blockproducers.title",
                    content: Blockproducers
                },
                {
                    name: "dxpcore",
                    link: "/account/" + accountName + "/voting/dxpcore",
                    translate: "explorer.dxpcore_members.title",
                    content: Dxpcore
                },
                {
                    name: "benefactors",
                    link: "/account/" + accountName + "/voting/benefactors",
                    translate: "account.votes.benefactors_short",
                    content: Benefactors
                }
            ]
        };

        this.onProxyAccountFound = this.onProxyAccountFound.bind(this);
        this.onPublish = this.onPublish.bind(this);
        this.onReset = this.onReset.bind(this);
        this._getVoteObjects = this._getVoteObjects.bind(this);

        this.showCreateLockModal = this.showCreateLockModal.bind(this);
        this.hideCreateLockModal = this.hideCreateLockModal.bind(this);
    }

    componentWillMount() {
        accountUtils.getFinalFeeAsset(this.props.account, "account_update");
        ChainStore.fetchAllBenefactors();
        this.getBudgetObject();
    }

    componentDidMount() {
        this.updateAccountData(this.props);
        this._getVoteObjects();
        this._getVoteObjects("dxpcore");
    }

    shouldComponentUpdate(np, ns) {
        return (
            ns.isCreateLockModalVisible !=
                this.state.isCreateLockModalVisible ||
            np.location.pathname !== this.props.location.pathname ||
            ns.prev_proxy_account_id !== this.state.prev_proxy_account_id ||
            ns.hideLegacyProposals !== this.state.hideLegacyProposals ||
            ns.vote_ids.size !== this.state.vote_ids.size ||
            ns.current_proxy_input !== this.state.current_proxy_input ||
            ns.filterSearch !== this.state.filterSearch ||
            ns.blockproducers !== this.state.blockproducers ||
            ns.dxpcore !== this.state.dxpcore
        );
    }

    componentWillReceiveProps(np) {
        if (np.account !== this.props.account) {
            const proxyId = np.proxy.get("id");
            let newState = {
                proxy_account_id: proxyId === "1.2.5" ? "" : proxyId
            };
            this.setState({prev_proxy_account_id: newState.proxy_account_id});
            this.updateAccountData(np, newState);
        }
        this.getBudgetObject();
    }

    updateAccountData({account}, state = this.state) {
        let {proxy_account_id} = state;
        const proxy = ChainStore.getAccount(proxy_account_id);
        let options = account.get("options");
        let proxyOptions = proxy ? proxy.get("options") : null;
        // let proxy_account_id = proxy ? proxy.get("id") : "1.2.5";
        let current_proxy_input = proxy ? proxy.get("name") : "";
        if (proxy_account_id === "1.2.5") {
            proxy_account_id = "";
            current_proxy_input = "";
        }

        let votes = options.get("votes");
        let vote_ids = votes.toArray();
        let vids = Immutable.Set(vote_ids);
        ChainStore.getObjectsByVoteIds(vote_ids);

        let proxyPromise = null,
            proxy_vids = Immutable.Set([]);
        const hasProxy = proxy_account_id !== "1.2.5";
        if (hasProxy && proxyOptions) {
            let proxy_votes = proxyOptions.get("votes");
            let proxy_vote_ids = proxy_votes.toArray();
            proxy_vids = Immutable.Set(proxy_vote_ids);
            ChainStore.getObjectsByVoteIds(proxy_vote_ids);

            proxyPromise = FetchChainObjects(
                ChainStore.getObjectByVoteID,
                proxy_vote_ids,
                10000
            );
        }

        Promise.all([
            FetchChainObjects(ChainStore.getObjectByVoteID, vote_ids, 10000),
            proxyPromise
        ]).then(res => {
            const [vote_objs, proxy_vote_objs] = res;
            function sortVoteObjects(objects) {
                let blockproducers = new Immutable.List();
                let dxpcore = new Immutable.List();
                let benefactors = new Immutable.Set();
                objects.forEach(obj => {
                    let account_id = obj.get("dxpcore_member_account");
                    if (account_id) {
                        dxpcore = dxpcore.push(account_id);
                    } else if ((account_id = obj.get("benefactor_account"))) {
                        // console.log( "benefactor: ", obj );
                        //     benefactors = benefactors.add(obj.get("id"));
                    } else if (
                        (account_id = obj.get("blockproducer_account"))
                    ) {
                        blockproducers = blockproducers.push(account_id);
                    }
                });

                return {blockproducers, dxpcore, benefactors};
            }

            let {blockproducers, dxpcore, benefactors} = sortVoteObjects(
                vote_objs
            );
            let {
                blockproducers: proxy_blockproducers,
                dxpcore: proxy_dxpcore,
                benefactors: proxy_benefactors
            } = sortVoteObjects(proxy_vote_objs || []);
            let state = {
                proxy_account_id,
                current_proxy_input,
                blockproducers: blockproducers,
                dxpcore: dxpcore,
                benefactors: benefactors,
                proxy_blockproducers: proxy_blockproducers,
                proxy_dxpcore: proxy_dxpcore,
                proxy_benefactors: proxy_benefactors,
                vote_ids: vids,
                proxy_vote_ids: proxy_vids,
                prev_blockproducers: blockproducers,
                prev_dxpcore: dxpcore,
                prev_benefactors: benefactors,
                prev_vote_ids: vids
            };
            this.setState(state);
        });
    }

    isChanged(s = this.state) {
        return (
            s.proxy_account_id !== s.prev_proxy_account_id ||
            s.blockproducers !== s.prev_blockproducers ||
            s.dxpcore !== s.prev_dxpcore ||
            !Immutable.is(s.vote_ids, s.prev_vote_ids)
        );
    }

    _getVoteObjects(type = BLOCKPRODUCERS_KEY, vote_ids) {
        let current = this.state[`all_${type}`];
        const isBlockproducer = type === BLOCKPRODUCERS_KEY;
        let lastIdx;
        if (!vote_ids) {
            vote_ids = [];
            let active = this.props.globalObject
                .get(
                    isBlockproducer
                        ? "active_blockproducers"
                        : "active_dxpcore_members"
                )
                .sort((a, b) => {
                    return (
                        parseInt(a.split(".")[2], 10) -
                        parseInt(b.split(".")[2], 10)
                    );
                });
            const lastActive =
                active.last() || `1.${isBlockproducer ? "6" : "5"}.1`;
            lastIdx = parseInt(lastActive.split(".")[2], 10);
            for (var i = 1; i <= lastIdx + 10; i++) {
                vote_ids.push(`1.${isBlockproducer ? "6" : "5"}.${i}`);
            }
        } else {
            lastIdx = parseInt(vote_ids[vote_ids.length - 1].split(".")[2], 10);
        }
        FetchChainObjects(ChainStore.getObject, vote_ids, 5000, {}).then(
            vote_objs => {
                this.state[`all_${type}`] = current.concat(
                    Immutable.List(
                        vote_objs
                            .filter(a => !!a)
                            .map(a =>
                                a.get(
                                    isBlockproducer
                                        ? "blockproducer_account"
                                        : "dxpcore_member_account"
                                )
                            )
                    )
                );
                if (!!vote_objs[vote_objs.length - 1]) {
                    // there are more valid vote objs, fetch 10 more
                    vote_ids = [];
                    for (var i = lastIdx + 11; i <= lastIdx + 20; i++) {
                        vote_ids.push(`1.${isBlockproducer ? "6" : "5"}.${i}`);
                    }
                    return this._getVoteObjects(type, vote_ids);
                }
                this.forceUpdate();
            }
        );
    }

    onRemoveProxy = () => {
        this.publish(null);
    };

    onPublish() {
        this.publish(this.state.proxy_account_id);
    }

    onCreateTicket() {
        ApplicationApi.createTicket(this.props.account, "1.3.0", 100000);
    }

    publish(new_proxy_id) {
        let updated_account = this.props.account.toJS();
        let updateObject = {account: updated_account.id};
        let new_options = {memo_key: updated_account.options.memo_key};
        // updated_account.new_options = updated_account.options;
        new_options.voting_account = new_proxy_id ? new_proxy_id : "1.2.5";
        new_options.num_blockproducer = this.state.blockproducers.size;
        new_options.num_dxpcore = this.state.dxpcore.size;

        updateObject.new_options = new_options;
        // Set fee asset
        updateObject.fee = {
            amount: 0,
            asset_id: accountUtils.getFinalFeeAsset(
                updated_account.id,
                "account_update"
            )
        };

        // Remove votes for expired benefactors
        let {vote_ids} = this.state;
        let benefactors = this._getBenefactorArray();
        let now = new Date();

        function removeVote(list, vote) {
            if (list.includes(vote)) {
                list = list.delete(vote);
            }
            return list;
        }

        benefactors.forEach(benefactor => {
            if (benefactor) {
                if (new Date(benefactor.get("work_end_date")) <= now) {
                    vote_ids = removeVote(vote_ids, benefactor.get("vote_for"));
                }

                // TEMP Remove vote_against since they're no longer used
                vote_ids = removeVote(vote_ids, benefactor.get("vote_against"));
            }
        });

        // Submit votes
        FetchChainObjects(
            ChainStore.getBlockproducerById,
            this.state.blockproducers.toArray(),
            4000
        )
            .then(res => {
                let blockproducers_vote_ids = res.map(o => o.get("vote_id"));
                return Promise.all([
                    Promise.resolve(blockproducers_vote_ids),
                    FetchChainObjects(
                        ChainStore.getDxpcoreMemberById,
                        this.state.dxpcore.toArray(),
                        4000
                    )
                ]);
            })
            .then(res => {
                updateObject.new_options.votes = res[0]
                    .concat(res[1].map(o => o.get("vote_id")))
                    .concat(
                        vote_ids
                            .filter(id => {
                                return id.split(":")[0] === "2";
                            })
                            .toArray()
                    )
                    .sort((a, b) => {
                        let a_split = a.split(":");
                        let b_split = b.split(":");

                        return (
                            parseInt(a_split[1], 10) - parseInt(b_split[1], 10)
                        );
                    });
                ApplicationApi.updateAccount(updateObject);
            });
    }

    _getBenefactorArray() {
        let benefactorArray = [];

        ChainStore.benefactors.forEach(benefactorId => {
            let benefactor = ChainStore.getObject(benefactorId, false, false);
            if (benefactor) benefactorArray.push(benefactor);
        });

        return benefactorArray;
    }

    onReset() {
        let s = this.state;
        if (
            this.refs.voting_proxy &&
            this.refs.voting_proxy.refs.bound_component
        )
            this.refs.voting_proxy.refs.bound_component.onResetProxy();
        this.setState(
            {
                proxy_account_id: s.prev_proxy_account_id,
                current_proxy_input: s.prev_proxy_input,
                blockproducers: s.prev_blockproducers,
                dxpcore: s.prev_dxpcore,
                benefactors: s.prev_benefactors,
                vote_ids: s.prev_vote_ids
            },
            () => {
                this.updateAccountData(this.props);
            }
        );
    }

    onAddItem(collection, item_id) {
        let state = {};
        state[collection] = this.state[collection].push(item_id);
        this.setState(state);
    }

    onRemoveItem(collection, item_id) {
        let state = {};
        state[collection] = this.state[collection].filter(i => i !== item_id);
        this.setState(state);
    }

    onChangeVotes(addVotes, removeVotes) {
        let state = {};
        state.vote_ids = this.state.vote_ids;
        if (addVotes.length) {
            addVotes.forEach(vote => {
                state.vote_ids = state.vote_ids.add(vote);
            });
        }
        if (removeVotes) {
            removeVotes.forEach(vote => {
                state.vote_ids = state.vote_ids.delete(vote);
            });
        }

        this.setState(state);
    }

    validateAccount(collection, account) {
        if (!account) return null;
        if (collection === BLOCKPRODUCERS_KEY) {
            return FetchChainObjects(
                ChainStore.getBlockproducerById,
                [account.get("id")],
                3000
            ).then(res => {
                return res[0] ? null : "Not a blockproducer";
            });
        }
        if (collection === "dxpcore") {
            return FetchChainObjects(
                ChainStore.getDxpcoreMemberById,
                [account.get("id")],
                3000
            ).then(res => {
                return res[0] ? null : "Not a dxpcore member";
            });
        }
        return null;
    }

    onProxyChange(current_proxy_input) {
        let proxyAccount = ChainStore.getAccount(current_proxy_input);
        if (
            !proxyAccount ||
            (proxyAccount &&
                proxyAccount.get("id") !== this.state.proxy_account_id)
        ) {
            this.setState({
                proxy_account_id: "",
                proxy_blockproducers: Immutable.Set(),
                proxy_dxpcore: Immutable.Set(),
                proxy_benefactors: Immutable.Set()
            });
        }
        this.setState({current_proxy_input});
    }

    onProxyAccountFound(proxy_account) {
        const proxy_account_id = proxy_account ? proxy_account.get("id") : "";
        if (this.state.proxy_account_id !== proxy_account_id)
            this.setState(
                {
                    proxy_account_id
                },
                () => {
                    this.updateAccountData(this.props);
                }
            );
    }

    onClearProxy() {
        this.setState({
            proxy_account_id: ""
        });
    }

    getBudgetObject() {
        let {lastBudgetObject} = this.state;
        let budgetObject;
        budgetObject = ChainStore.getObject(lastBudgetObject);
        let idIndex = parseInt(lastBudgetObject.split(".")[2], 10);
        if (budgetObject) {
            let timestamp = budgetObject.get("time");
            if (!/Z$/.test(timestamp)) {
                timestamp += "Z";
            }
            let now = new Date();

            /* Use the last valid budget object to estimate the current budget object id.
             ** Budget objects are created once per hour
             */
            let currentID =
                idIndex +
                Math.floor(
                    (now - new Date(timestamp).getTime()) / 1000 / 60 / 60
                ) -
                1;
            if (idIndex >= currentID) return;
            let newID = "2.13." + Math.max(idIndex, currentID);
            let newIDInt = parseInt(newID.split(".")[2], 10);
            FetchChainObjects(
                ChainStore.getObject,
                [newID],
                undefined,
                {}
            ).then(res => {
                let [lbo] = res;
                if (lbo === null) {
                    // The object does not exist, the id was too high
                    let lastId = `2.13.${newIDInt - 1}`;
                    if (lastId != lastBudgetObject) {
                        this.setState(
                            {lastBudgetObject: `2.13.${newIDInt - 1}`},
                            this.getBudgetObject
                        );
                    }
                } else {
                    SettingsStore.setLastBudgetObject(newID);

                    this.setState({lastBudgetObject: newID});
                }
            });
        } else {
            // The object does not exist, decrement the ID
            let newID = `2.13.${idIndex - 1}`;
            FetchChainObjects(
                ChainStore.getObject,
                [newID],
                undefined,
                {}
            ).then(res => {
                let [lbo] = res;
                if (lbo === null) {
                    // The object does not exist, the id was too high
                    this.setState(
                        {lastBudgetObject: `2.13.${idIndex - 2}`},
                        this.getBudgetObject
                    );
                } else {
                    SettingsStore.setLastBudgetObject(newID);
                    this.setState({lastBudgetObject: newID});
                }
            });
        }
    }

    handleFilterChange(e) {
        this.setState({
            filterSearch: e.target.value || ""
        });
    }

    render() {
        const {
            prev_proxy_account_id,
            hideLegacyProposals,
            filterSearch,
            all_blockproducers,
            proxy_blockproducers,
            blockproducers,
            all_dxpcore,
            proxy_dxpcore,
            dxpcore,
            vote_ids,
            proxy_vote_ids,
            proxy_account_id
        } = this.state;
        const accountHasProxy = !!prev_proxy_account_id;
        const preferredUnit = this.props.settings.get("unit") || "1.3.0";
        const hasProxy = !!proxy_account_id; // this.props.account.getIn(["options", "voting_account"]) !== "1.2.5";
        const {globalObject, account} = this.props;
        const {totalBudget, benefactorBudget} = this._getBudgets(globalObject);

        const actionButtons = this._getActionButtons();

        const proxyInput = this._getProxyInput(accountHasProxy);

        const hideLegacy = this._getHideLegacyOptions();

        const onFilterChange = this.handleFilterChange.bind(this);
        const validateAccountHandler = this.validateAccount.bind(
            this,
            BLOCKPRODUCERS_KEY
        );
        const addBlockproducerHandler = this.onAddItem.bind(
            this,
            BLOCKPRODUCERS_KEY
        );
        const removeBlockproducerHandler = this.onRemoveItem.bind(
            this,
            BLOCKPRODUCERS_KEY
        );
        const onChangeVotes = this.onChangeVotes.bind(this);
        const getBenefactorArray = this._getBenefactorArray.bind(this);
        const addDxpcoreHandler = this.onAddItem.bind(this, DXPCORE_KEY);
        const removeDxpcoreHandler = this.onRemoveItem.bind(this, DXPCORE_KEY);

        const onTabChange = value => {
            this.props.history.push(value);
        };

        const increase_voting_power = (
            <Tooltip
                title={counterpart.translate(
                    "account.votes.cast_votes_through_one_operation"
                )}
                mouseEnterDelay={0.5}
            >
                <div
                    style={{
                        float: "right"
                    }}
                >
                    <Button type="primary" onClick={this.showCreateLockModal}>
                        <Translate content="voting.increase_voting_power" />
                    </Button>
                </div>
            </Tooltip>
        );
        return (
            <div className="main-content grid-content">
                <div className="voting">
                    <div className="padding">
                        <div>
                            <Translate content="voting.title" component="h1" />
                            <Translate
                                content="voting.description"
                                component="p"
                            />
                        </div>
                        <div className="ticket-row">
                            {increase_voting_power}
                            <Translate
                                content="voting.ticket_explanation"
                                component="p"
                            />
                        </div>
                        <div className="proxy-row">
                            {proxyInput}
                            {actionButtons}
                        </div>
                    </div>

                    <Tabs
                        activeKey={this.props.location.pathname}
                        animated={false}
                        style={{
                            display: "table",
                            height: "100%",
                            width: "100%"
                        }}
                        onChange={onTabChange}
                    >
                        {this.state.tabs.map(tab => {
                            const TabContent = tab.content;

                            return (
                                <Tabs.TabPane
                                    key={tab.link}
                                    tab={counterpart.translate(tab.translate)}
                                >
                                    <TabContent
                                        all_blockproducers={all_blockproducers}
                                        proxy_blockproducers={
                                            proxy_blockproducers
                                        }
                                        blockproducers={blockproducers}
                                        proxy_account_id={proxy_account_id}
                                        onFilterChange={onFilterChange}
                                        validateAccountHandler={
                                            validateAccountHandler
                                        }
                                        addBlockproducerHandler={
                                            addBlockproducerHandler
                                        }
                                        removeBlockproducerHandler={
                                            removeBlockproducerHandler
                                        }
                                        hasProxy={hasProxy}
                                        globalObject={globalObject}
                                        filterSearch={filterSearch}
                                        account={account}
                                        all_dxpcore={all_dxpcore}
                                        proxy_dxpcore={proxy_dxpcore}
                                        dxpcore={dxpcore}
                                        addDxpcoreHandler={addDxpcoreHandler}
                                        removeDxpcoreHandler={
                                            removeDxpcoreHandler
                                        }
                                        vote_ids={vote_ids}
                                        proxy_vote_ids={proxy_vote_ids}
                                        hideLegacy={hideLegacy}
                                        preferredUnit={preferredUnit}
                                        totalBudget={totalBudget}
                                        benefactorBudget={benefactorBudget}
                                        hideLegacyProposals={
                                            hideLegacyProposals
                                        }
                                        onChangeVotes={onChangeVotes}
                                        getBenefactorArray={getBenefactorArray}
                                        viewSettings={this.props.viewSettings}
                                    />
                                </Tabs.TabPane>
                            );
                        })}
                    </Tabs>
                </div>
                {/* CreateLock Modal */}
                {(this.state.isCreateLockModalVisible ||
                    this.state.isCreateLockModalVisibleBefore) && (
                    <CreateLockModal
                        visible={this.state.isCreateLockModalVisible}
                        hideModal={this.hideCreateLockModal}
                        asset={"1.3.0"}
                        account={this.props.account}
                    />
                )}
            </div>
        );
    }

    showCreateLockModal() {
        this.setState({
            isCreateLockModalVisible: true,
            isCreateLockModalVisibleBefore: true
        });
    }

    hideCreateLockModal() {
        this.setState({
            isCreateLockModalVisible: false
        });
    }

    _getBudgets(globalObject) {
        let budgetObject;
        if (this.state.lastBudgetObject) {
            budgetObject = ChainStore.getObject(this.state.lastBudgetObject);
        }
        let totalBudget = 0;
        let benefactorBudget = globalObject
            ? parseInt(
                  globalObject.getIn([
                      "parameters",
                      "benefactor_budget_per_day"
                  ]),
                  10
              )
            : 0;
        if (budgetObject) {
            benefactorBudget = Math.min(
                24 * budgetObject.getIn(["record", "benefactor_budget"]),
                benefactorBudget
            );
            totalBudget = Math.min(
                24 * budgetObject.getIn(["record", "benefactor_budget"]),
                benefactorBudget
            );
        }
        return {totalBudget, benefactorBudget};
    }

    _getProxyInput(accountHasProxy) {
        return (
            <React.Fragment>
                <AccountSelector
                    label="account.votes.proxy_short"
                    style={{
                        width: "50%",
                        maxWidth: 250,
                        display: "inline-block"
                    }}
                    account={this.state.current_proxy_input}
                    accountName={this.state.current_proxy_input}
                    onChange={this.onProxyChange.bind(this)}
                    onAccountChanged={this.onProxyAccountFound}
                    tabIndex={1}
                    placeholder={counterpart.translate(
                        "account.votes.set_proxy"
                    )}
                    tooltip={counterpart.translate(
                        !this.state.proxy_account_id
                            ? "tooltip.proxy_search"
                            : "tooltip.proxy_remove"
                    )}
                    hideImage
                >
                    <span
                        style={{
                            paddingLeft: 5,
                            position: "relative",
                            top: 9
                        }}
                    >
                        <Link to="/help/voting">
                            <Icon
                                name="question-circle"
                                title="icons.question_circle"
                                size="1x"
                            />
                        </Link>
                    </span>
                </AccountSelector>
                {accountHasProxy && (
                    <Button
                        style={{marginLeft: "1rem"}}
                        onClick={this.onRemoveProxy}
                        tabIndex={9}
                    >
                        <Translate content="account.perm.remove_proxy" />
                    </Button>
                )}
            </React.Fragment>
        );
    }

    _getHideLegacyOptions() {
        return (
            <div
                className="inline-block"
                style={{marginLeft: "0.5em"}}
                onClick={() => {
                    this.setState({
                        hideLegacyProposals: !this.state.hideLegacyProposals
                    });
                }}
            >
                <Tooltip
                    title={counterpart.translate("tooltip.legacy_explanation")}
                >
                    <Switch
                        style={{marginRight: 6, marginTop: -3}}
                        checked={this.state.hideLegacyProposals}
                    />
                    <Translate content="account.votes.hide_legacy_proposals" />
                </Tooltip>
            </div>
        );
    }

    _getActionButtons() {
        return (
            <Tooltip
                title={counterpart.translate(
                    "account.votes.cast_votes_through_one_operation"
                )}
                mouseEnterDelay={0.5}
            >
                <div
                    style={{
                        float: "right"
                    }}
                >
                    <Button
                        type="primary"
                        onClick={this.onPublish}
                        tabIndex={4}
                        disabled={!this.isChanged() ? true : undefined}
                    >
                        <Translate content="account.votes.publish" />
                    </Button>
                    <Button
                        style={{marginLeft: "8px"}}
                        onClick={this.onReset}
                        tabIndex={8}
                    >
                        <Translate content="account.perm.reset" />
                    </Button>
                </div>
            </Tooltip>
        );
    }
}
AccountVoting = BindToChainState(AccountVoting);

const FillMissingProps = props => {
    let missingProps = {};
    if (!props.initialBudget) {
        missingProps.initialBudget = SettingsStore.getLastBudgetObject();
    }
    if (!props.account) {
        // don't use store listener, user might be looking at different account. this is for reasonable default
        let accountName =
            AccountStore.getState().currentAccount ||
            AccountStore.getState().passwordAccount;
        accountName =
            accountName && accountName !== "null"
                ? accountName
                : "dxpcore-account";
        missingProps.account = accountName;
    }
    if (!props.proxy) {
        const account = ChainStore.getAccount(props.account);
        let proxy = null;
        if (account) {
            proxy = account.getIn(["options", "voting_account"]);
        } else {
            throw "Account must be loaded";
        }
        missingProps.proxy = proxy;
    }

    return <AccountVoting {...props} {...missingProps} />;
};

export default withRouter(FillMissingProps);
