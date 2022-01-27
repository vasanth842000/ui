import React from "react";
import Translate from "react-translate-component";
import BenefactorsList from "../BenefactorsList";
import {Link} from "react-router-dom";
import AssetName from "../../Utility/AssetName";
import counterpart from "counterpart";
import {EquivalentValueComponent} from "../../Utility/EquivalentValueComponent";
import FormattedAsset from "../../Utility/FormattedAsset";
import {
    Row,
    Col,
    Radio,
    Input,
    Icon as AntIcon,
    Button
} from "dxperts-ui-style-guide";
import SearchInput from "../../Utility/SearchInput";

export default class Benefactors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newBenefactorsLength: null,
            activeBenefactorsLength: null,
            pollsLength: null,
            expiredBenefactorsLength: null,
            voteThreshold: null,
            benefactorTableIndex: props.viewSettings.get(
                "benefactorTableIndex",
                1
            )
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            ns.newBenefactorsLength !== this.state.newBenefactorsLength ||
            ns.activeBenefactorsLength !== this.state.activeBenefactorsLength ||
            ns.pollsLength !== this.state.pollsLength ||
            ns.expiredBenefactorsLength !==
                this.state.expiredBenefactorsLength ||
            ns.voteThreshold !== this.state.voteThreshold ||
            np.benefactorTableIndex !== this.state.benefactorTableIndex
        );
    }

    render() {
        const {
            vote_ids,
            proxy_vote_ids,
            hideLegacy,
            preferredUnit,
            globalObject,
            totalBudget,
            benefactorBudget,
            hideLegacyProposals,
            hasProxy,
            filterSearch,
            onFilterChange,
            onChangeVotes,
            getBenefactorArray
        } = this.props;

        const {
            benefactorTableIndex,
            newBenefactorsLength,
            activeBenefactorsLength,
            pollsLength,
            expiredBenefactorsLength,
            voteThreshold
        } = this.state;

        const setBenefactorTableIndex = e => {
            this.setState({
                benefactorTableIndex: e.target.value
            });
        };

        // fixme the way BenefactorsList is injected with benefactorslist is a complete design fail. use proper controlled component

        return (
            <div>
                <div className="header-selector">
                    <div style={{float: "right"}}>
                        <Button>
                            <Link to="/create-benefactor">
                                <Translate content="account.votes.create_benefactor" />
                            </Link>
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
                        <Radio.Group
                            defaultValue={1}
                            onChange={setBenefactorTableIndex}
                        >
                            <Radio value={0}>
                                {counterpart.translate("account.votes.new", {
                                    count: newBenefactorsLength
                                })}
                            </Radio>

                            <Radio value={1}>
                                {counterpart.translate("account.votes.active", {
                                    count: activeBenefactorsLength
                                })}
                            </Radio>

                            {pollsLength ? (
                                <Radio value={3}>
                                    {counterpart.translate(
                                        "account.votes.polls",
                                        {count: pollsLength}
                                    )}
                                </Radio>
                            ) : null}

                            {expiredBenefactorsLength ? (
                                <Radio value={2}>
                                    <Translate content="account.votes.expired" />
                                </Radio>
                            ) : null}
                        </Radio.Group>
                    </div>

                    {hideLegacy}
                    <br />
                    <br />
                    <Row>
                        <Col span={3}>
                            <Translate content="account.votes.threshold" /> (
                            <AssetName name={preferredUnit} />)
                        </Col>
                        <Col
                            span={3}
                            style={{
                                marginLeft: "10px"
                            }}
                        >
                            <FormattedAsset
                                decimalOffset={4}
                                hide_asset
                                amount={voteThreshold}
                                asset="1.3.0"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={3}>
                            <Translate content="account.votes.total_budget" /> (
                            <AssetName name={preferredUnit} />)
                        </Col>
                        <Col
                            span={3}
                            style={{
                                marginLeft: "10px"
                            }}
                        >
                            {globalObject ? (
                                <EquivalentValueComponent
                                    hide_asset
                                    fromAsset="1.3.0"
                                    toAsset={preferredUnit}
                                    amount={totalBudget}
                                />
                            ) : null}
                        </Col>
                    </Row>
                </div>
                <BenefactorsList
                    benefactorTableIndex={benefactorTableIndex}
                    preferredUnit={preferredUnit}
                    setBenefactorsLength={(
                        _newBenefactorsLength,
                        _activeBenefactorsLength,
                        _pollsLength,
                        _expiredBenefactorsLength,
                        _voteThreshold
                    ) => {
                        if (
                            _newBenefactorsLength !==
                                this.state.newBenefactorsLength ||
                            _activeBenefactorsLength !==
                                this.state.activeBenefactorsLength ||
                            _pollsLength !== this.state.pollsLength ||
                            _expiredBenefactorsLength !==
                                this.state.expiredBenefactorsLength ||
                            _voteThreshold !== this.state.voteThreshold
                        ) {
                            this.setState({
                                newBenefactorsLength: _newBenefactorsLength,
                                activeBenefactorsLength: _activeBenefactorsLength,
                                pollsLength: _pollsLength,
                                expiredBenefactorsLength: _expiredBenefactorsLength,
                                voteThreshold: _voteThreshold
                            });
                        }
                    }}
                    benefactorBudget={benefactorBudget}
                    hideLegacyProposals={hideLegacyProposals}
                    hasProxy={hasProxy}
                    proxy_vote_ids={proxy_vote_ids}
                    vote_ids={vote_ids}
                    onChangeVotes={onChangeVotes}
                    getBenefactorArray={getBenefactorArray}
                    filterSearch={filterSearch}
                />
            </div>
        );
    }
}
