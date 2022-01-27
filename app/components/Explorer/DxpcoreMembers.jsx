import counterpart from "counterpart";
import React from "react";
import Immutable from "immutable";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import {ChainStore} from "dxpertsjs";
import {connect} from "alt-react";
import SettingsActions from "actions/SettingsActions";
import FormattedAsset from "../Utility/FormattedAsset";
import SettingsStore from "stores/SettingsStore";
import {Table} from "dxperts-ui-style-guide";
import SearchInput from "../Utility/SearchInput";
import utils from "common/utils";

class DxpcoreMemberList extends React.Component {
    static propTypes = {
        dxpcore_members: ChainTypes.ChainObjectsList.isRequired
    };

    constructor() {
        super();
    }

    render() {
        let {dxpcore_members, membersList} = this.props;

        let dataSource = null;

        let ranks = {};

        dxpcore_members
            .filter(a => {
                if (!a) {
                    return false;
                }
                return membersList.indexOf(a.get("id")) !== -1;
            })
            .forEach((c, index) => {
                if (c) {
                    ranks[c.get("id")] = index + 1;
                }
            });

        if (dxpcore_members.length > 0 && dxpcore_members[1]) {
            dataSource = dxpcore_members
                .filter(a => {
                    if (!a) {
                        return false;
                    }
                    let account = ChainStore.getObject(
                        a.get("dxpcore_member_account")
                    );
                    if (!account) {
                        return false;
                    }

                    let account_data = ChainStore.getDxpcoreMemberById(
                        account.get("id")
                    );

                    if (!account_data) return false;

                    return (
                        account.get("name").indexOf(this.props.filter || "") !==
                        -1
                    );
                })
                .map(a => {
                    let account = ChainStore.getObject(
                        a.get("dxpcore_member_account")
                    );

                    let account_data = ChainStore.getDxpcoreMemberById(
                        account.get("id")
                    );

                    return {
                        key: a.get("id"),
                        rank: ranks[a.get("id")],
                        name: account.get("name"),
                        votes: account_data.get("total_votes"),
                        url: utils.sanitize(account_data.get("url"))
                    };
                });
        }

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
                key: "url",
                title: "WEBPAGE",
                dataIndex: "url",
                render: item => (
                    <a href={item} target="_blank" rel="noopener noreferrer">
                        {item}
                    </a>
                )
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
            />
        );
    }
}
DxpcoreMemberList = BindToChainState(DxpcoreMemberList, {
    show_loader: true
});

class DxpcoreMembers extends React.Component {
    static propTypes = {
        globalObject: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        globalObject: "2.0.0"
    };

    constructor(props) {
        super(props);
        this.state = {
            filterDxpcoreMember: props.filterDxpcoreMember || ""
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !Immutable.is(nextProps.globalObject, this.props.globalObject) ||
            nextState.filterDxpcoreMember !== this.state.filterDxpcoreMember ||
            nextState.cardView !== this.state.cardView
        );
    }

    _onFilter(e) {
        this.setState({filterDxpcoreMember: e.target.value.toLowerCase()});

        SettingsActions.changeViewSetting({
            filterDxpcoreMember: e.target.value.toLowerCase()
        });
    }

    render() {
        let {globalObject} = this.props;
        globalObject = globalObject.toJS();

        let activeDxpcoreMembers = [];
        for (let key in globalObject.active_dxpcore_members) {
            if (globalObject.active_dxpcore_members.hasOwnProperty(key)) {
                activeDxpcoreMembers.push(
                    globalObject.active_dxpcore_members[key]
                );
            }
        }

        return (
            <div className="grid-block">
                <div className="grid-block vertical medium-horizontal">
                    <div className="grid-block vertical">
                        <div className="grid-content">
                            <SearchInput
                                placeholder={counterpart.translate(
                                    "explorer.blockproducers.filter_by_name"
                                )}
                                value={this.state.filterDxpcoreMember}
                                onChange={this._onFilter.bind(this)}
                                style={{
                                    width: "200px",
                                    marginBottom: "12px",
                                    marginTop: "4px"
                                }}
                            />
                            <DxpcoreMemberList
                                filter={this.state.filterDxpcoreMember}
                                dxpcore_members={Immutable.List(
                                    globalObject.active_dxpcore_members
                                )}
                                membersList={
                                    globalObject.active_dxpcore_members
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
DxpcoreMembers = BindToChainState(DxpcoreMembers);

class DxpcoreMembersStoreWrapper extends React.Component {
    render() {
        return <DxpcoreMembers {...this.props} />;
    }
}

DxpcoreMembersStoreWrapper = connect(DxpcoreMembersStoreWrapper, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            cardView: SettingsStore.getState().viewSettings.get(
                "cardViewDxpcore"
            ),
            filterDxpcoreMember: SettingsStore.getState().viewSettings.get(
                "filterDxpcoreMember"
            )
        };
    }
});

export default DxpcoreMembersStoreWrapper;
