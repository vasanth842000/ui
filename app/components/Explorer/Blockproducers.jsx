import counterpart from "counterpart";
import React from "react";
import Immutable from "immutable";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import {ChainStore} from "dxpertsjs";
import FormattedAsset from "../Utility/FormattedAsset";
import Translate from "react-translate-component";
import TimeAgo from "../Utility/TimeAgo";
import {connect} from "alt-react";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";
import classNames from "classnames";
import {withRouter} from "react-router-dom";
import {Table, Icon, Input, Popover} from "dxperts-ui-style-guide";
import sanitize from "sanitize";
import SearchInput from "../Utility/SearchInput";
import utils from "common/utils";

require("./blockproducers.scss");

class BlockproducerRow extends React.Component {
    static propTypes = {
        blockproducer: ChainTypes.ChainAccount.isRequired
    };

    _onRowClick(e) {
        e.preventDefault();
        this.props.history.push(
            `/account/${this.props.blockproducer.get("name")}`
        );
    }

    // componentWillUnmount() {
    //     ChainStore.unSubFrom("blockproducers", ChainStore.getBlockproducerById( this.props.blockproducer.get("id") ).get("id"));
    // }

    render() {
        let {blockproducer, isCurrent, rank} = this.props;
        let blockproducer_data = ChainStore.getBlockproducerById(
            this.props.blockproducer.get("id")
        );
        if (!blockproducer_data) return null;
        let total_votes = blockproducer_data.get("total_votes");

        let blockproducer_aslot = blockproducer_data.get("last_aslot");
        let color = {};
        if (this.props.most_recent - blockproducer_aslot > 100) {
            color = {borderLeft: "1px solid #FCAB53"};
        } else {
            color = {borderLeft: "1px solid #50D2C2"};
        }
        let last_aslot_time = new Date(
            Date.now() -
                (this.props.most_recent - blockproducer_aslot) *
                    ChainStore.getObject("2.0.0").getIn([
                        "parameters",
                        "block_interval"
                    ]) *
                    1000
        );

        let currentClass = isCurrent ? "active-blockproducer" : "";

        let missed = blockproducer_data.get("total_missed");
        let missedClass = classNames(
            "txtlabel",
            {success: missed <= 500},
            {info: missed > 500 && missed <= 1250},
            {warning: missed > 1250 && missed <= 2000},
            {error: missed >= 200}
        );

        return (
            <tr className={currentClass} onClick={this._onRowClick.bind(this)}>
                <td>{rank}</td>
                <td style={color}>{blockproducer.get("name")}</td>
                <td>
                    <TimeAgo time={new Date(last_aslot_time)} />
                </td>
                <td>{blockproducer_data.get("last_confirmed_block_num")}</td>
                <td className={missedClass}>{missed}</td>
                <td>
                    <FormattedAsset
                        amount={blockproducer_data.get("total_votes")}
                        asset="1.3.0"
                        decimalOffset={5}
                    />
                </td>
            </tr>
        );
    }
}
BlockproducerRow = BindToChainState(BlockproducerRow);
BlockproducerRow = withRouter(BlockproducerRow);

class BlockproducerList extends React.Component {
    static propTypes = {
        blockproducers: ChainTypes.ChainObjectsList.isRequired
    };

    constructor() {
        super();
        this.state = {
            sortBy: "rank",
            inverseSort: true
        };

        this.handleBlockIdClick = this.handleBlockIdClick.bind(this);
    }

    _setSort(field) {
        this.setState({
            sortBy: field,
            inverseSort:
                field === this.state.sortBy
                    ? !this.state.inverseSort
                    : this.state.inverseSort
        });
    }

    handleBlockIdClick(blockId) {
        return () => {
            this.props.history.push(`/block/${blockId}`);
        };
    }

    render() {
        let {blockproducers, current, cardView, blockproducerList} = this.props;
        let {sortBy, inverseSort} = this.state;
        let most_recent_aslot = 0;
        let ranks = {};

        blockproducers
            .filter(a => {
                if (!a) {
                    return false;
                }
                return blockproducerList.indexOf(a.get("id")) !== -1;
            })
            .sort((a, b) => {
                if (a && b) {
                    return (
                        parseInt(b.get("total_votes"), 10) -
                        parseInt(a.get("total_votes"), 10)
                    );
                }
            })
            .forEach((w, index) => {
                if (w) {
                    let s = w.get("last_aslot");
                    if (most_recent_aslot < s) {
                        most_recent_aslot = s;
                    }

                    ranks[w.get("id")] = index + 1;
                }
            });

        let dataSource = [];
        if (blockproducers.length > 0 && blockproducers[1]) {
            dataSource = blockproducers
                .filter(a => {
                    if (!a) {
                        return false;
                    }
                    let blockproducer = ChainStore.getObject(
                        a.get("blockproducer_account")
                    );
                    if (!blockproducer) return false;

                    let blockproducer_data = ChainStore.getBlockproducerById(
                        blockproducer.get("id")
                    );
                    if (!blockproducer_data) return false;

                    let name = blockproducer.get("name");
                    if (!name) return false;
                    return name.indexOf(this.props.filter) !== -1;
                })
                .map(a => {
                    const blockproducer = ChainStore.getObject(
                        a.get("blockproducer_account")
                    );

                    const blockproducer_data = ChainStore.getBlockproducerById(
                        blockproducer.get("id")
                    );

                    let blockproducer_aslot = blockproducer_data.get(
                        "last_aslot"
                    );

                    let last_aslot_time = new Date(
                        Date.now() -
                            (this.props.current_aslot - blockproducer_aslot) *
                                ChainStore.getObject("2.0.0").getIn([
                                    "parameters",
                                    "block_interval"
                                ]) *
                                1000
                    );

                    return {
                        id: a.get("id"),
                        key: blockproducer.get("name"),
                        rank: ranks[a.get("id")],
                        name: blockproducer.get("name"),
                        signing_key: blockproducer_data.get("signing_key"),
                        url: utils.sanitize(blockproducer_data.get("url")),
                        lastConfirmedBlock: {
                            id: blockproducer_data.get(
                                "last_confirmed_block_num"
                            ),
                            timestamp: last_aslot_time.getTime()
                        },
                        blocksMissed: blockproducer_data.get("total_missed"),
                        votes: blockproducer_data.get("total_votes")
                    };
                });
        }

        const urlValid = item => {
            const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            return regex.test(item);
        };

        const urlRender = item => {
            return (
                <Popover
                    content={
                        <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {item}
                        </a>
                    }
                    trigger={"hover"}
                >
                    <Icon type="link" />
                </Popover>
            );
        };

        const keyRender = item => {
            return (
                <Popover content={<span>{item}</span>} trigger={"hover"}>
                    <Icon type="key" />
                </Popover>
            );
        };

        const columns = [
            {
                key: "#",
                title: "#",
                dataIndex: "rank",
                sorter: (a, b) => {
                    return a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0;
                }
            },
            {
                key: "name",
                title: "NAME",
                dataIndex: "name",
                sorter: (a, b) => {
                    return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
                }
            },
            {
                key: "url",
                title: "URL",
                dataIndex: "url",
                align: "center",
                render: item => (
                    <div style={{width: "100%", textAlign: "center"}}>
                        {(item && urlValid(item) && urlRender(item)) || null}
                    </div>
                )
            },
            {
                key: "lastConfirmedBlock",
                title: "LAST CONFIRMED BLOCK",
                dataIndex: "lastConfirmedBlock",
                render: item => (
                    <span>
                        <a
                            style={{display: "inline-block", minWidth: "100px"}}
                            href="javascript:void(0)"
                            onClick={this.handleBlockIdClick(item.id)}
                        >
                            #{Number(item.id).toLocaleString()}
                        </a>{" "}
                        <TimeAgo time={new Date(item.timestamp)} />
                    </span>
                ),
                sorter: (a, b) => {
                    return a.lastConfirmedBlock.timestamp >
                        b.lastConfirmedBlock.timestamp
                        ? -1
                        : a.lastConfirmedBlock.timestamp <
                          b.lastConfirmedBlock.timestamp
                        ? 1
                        : 0;
                }
            },
            {
                key: "blocksMissed",
                title: "BLOCKS MISSED",
                dataIndex: "blocksMissed",
                render: item => {
                    const blocksMissedClassName = classNames(
                        "txtlabel",
                        {success: item <= 500},
                        {info: item > 500 && item <= 1250},
                        {warning: item > 1250 && item <= 2000},
                        {error: item >= 200}
                    );
                    return (
                        <span className={blocksMissedClassName}>{item}</span>
                    );
                },
                sorter: (a, b) => {
                    return a.blocksMissed > b.blocksMissed
                        ? 1
                        : a.blocksMissed < b.blocksMissed
                        ? -1
                        : 0;
                }
            },
            {
                key: "votes",
                title: "VOTES",
                dataIndex: "votes",
                render: item => (
                    <FormattedAsset
                        amount={item}
                        asset="1.3.0"
                        decimalOffset={5}
                    />
                ),
                sorter: (a, b) => {
                    return a.votes > b.votes ? 1 : a.votes < b.votes ? -1 : 0;
                }
            },
            {
                key: "key",
                title: "KEY",
                dataIndex: "signing_key",
                align: "center",
                render: item => (
                    <div style={{textAlign: "center", width: "100%"}}>
                        {keyRender(item)}
                    </div>
                )
            }
        ];

        const getRowClassName = record => {
            if (record.id === current) return "active-blockproducer";

            return "";
        };

        return (
            <Table
                rowClassName={getRowClassName}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
            />
        );
    }
}
BlockproducerList = BindToChainState(BlockproducerList, {
    show_loader: true
});
BlockproducerList = withRouter(BlockproducerList);

class Blockproducers extends React.Component {
    static propTypes = {
        globalObject: ChainTypes.ChainObject.isRequired,
        dynGlobalObject: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        globalObject: "2.0.0",
        dynGlobalObject: "2.1.0"
    };

    constructor(props) {
        super(props);

        this.state = {
            filterBlockproducer: props.filterBlockproducer || "",
            cardView: props.cardView
        };
    }

    _onFilter(e) {
        this.setState({filterBlockproducer: e.target.value.toLowerCase()});

        SettingsActions.changeViewSetting({
            filterBlockproducer: e.target.value.toLowerCase()
        });
    }

    _toggleView() {
        SettingsActions.changeViewSetting({
            cardView: !this.state.cardView
        });

        this.setState({
            cardView: !this.state.cardView
        });
    }

    render() {
        let {dynGlobalObject, globalObject} = this.props;
        dynGlobalObject = dynGlobalObject.toJS();
        globalObject = globalObject.toJS();

        let current = ChainStore.getObject(
                dynGlobalObject.current_blockproducer
            ),
            currentAccount = null;
        if (current) {
            currentAccount = ChainStore.getObject(
                current.get("blockproducer_account")
            );
        }

        return (
            <div className="grid-block">
                <div className="grid-block">
                    <div className="grid-block">
                        <div className="grid-content ">
                            <div className="explore-blockproducer--info">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <Translate content="explorer.blockproducers.current" />
                                            </th>
                                            <th>
                                                <Translate content="explorer.blocks.active_blockproducers" />
                                            </th>
                                            <th>
                                                <Translate content="explorer.blockproducers.participation" />
                                            </th>
                                            <th>
                                                <Translate content="explorer.blockproducers.pay" />
                                            </th>
                                            <th>
                                                <Translate content="explorer.blockproducers.budget" />
                                            </th>
                                            <th>
                                                <Translate content="explorer.blockproducers.next_vote" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {currentAccount
                                                    ? currentAccount.get("name")
                                                    : null}
                                            </td>
                                            <td>
                                                {
                                                    Object.keys(
                                                        globalObject.active_blockproducers
                                                    ).length
                                                }
                                            </td>
                                            <td>
                                                {dynGlobalObject.participation}%
                                            </td>
                                            <td>
                                                <FormattedAsset
                                                    amount={
                                                        globalObject.parameters
                                                            .blockproducer_pay_per_block
                                                    }
                                                    asset="1.3.0"
                                                />
                                            </td>
                                            <td>
                                                {" "}
                                                <FormattedAsset
                                                    amount={
                                                        dynGlobalObject.blockproducer_budget
                                                    }
                                                    asset="1.3.0"
                                                />
                                            </td>
                                            <td>
                                                {" "}
                                                <TimeAgo
                                                    time={
                                                        new Date(
                                                            dynGlobalObject.next_maintenance_time +
                                                                "Z"
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <SearchInput
                                placeholder={counterpart.translate(
                                    "explorer.blockproducers.filter_by_name"
                                )}
                                value={this.state.filterBlockproducer}
                                onChange={this._onFilter.bind(this)}
                                style={{
                                    width: "200px",
                                    marginBottom: "12px",
                                    marginTop: "4px"
                                }}
                            />

                            <BlockproducerList
                                current_aslot={dynGlobalObject.current_aslot}
                                current={current ? current.get("id") : null}
                                blockproducers={Immutable.List(
                                    globalObject.active_blockproducers
                                )}
                                blockproducerList={
                                    globalObject.active_blockproducers
                                }
                                filter={this.state.filterBlockproducer}
                                cardView={this.state.cardView}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
Blockproducers = BindToChainState(Blockproducers);

class BlockproducerStoreWrapper extends React.Component {
    render() {
        return <Blockproducers {...this.props} />;
    }
}

BlockproducerStoreWrapper = connect(BlockproducerStoreWrapper, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            cardView: SettingsStore.getState().viewSettings.get("cardView"),
            filterBlockproducer: SettingsStore.getState().viewSettings.get(
                "filterBlockproducer"
            )
        };
    }
});

export default BlockproducerStoreWrapper;
