import React from "react";
import counterpart from "counterpart";
import utils from "common/utils";
import FormattedAsset from "../Utility/FormattedAsset";
import LinkToAccountById from "../Utility/LinkToAccountById";
import BindToChainState from "../Utility/BindToChainState";
import {EquivalentValueComponent} from "../Utility/EquivalentValueComponent";
import Icon from "components/Icon/Icon";
import PaginatedList from "components/Utility/PaginatedList";
import Translate from "react-translate-component";
import AssetName from "../Utility/AssetName";
import stringSimilarity from "string-similarity";
import {hiddenProposals} from "../../lib/common/hideProposals";
import sanitize from "sanitize";

class BenefactorList extends React.Component {
    constructor(props) {
        super(props);
    }

    onApprove(item) {
        let addVotes = [],
            removeVotes = [];

        if (item.vote_ids.has(item.benefactor.get("vote_against"))) {
            removeVotes.push(item.benefactor.get("vote_against"));
        }

        if (!item.vote_ids.has(item.benefactor.get("vote_for"))) {
            addVotes.push(item.benefactor.get("vote_for"));
        }

        this.props.onChangeVotes(addVotes, removeVotes);
    }

    onReject(item) {
        let addVotes = [],
            removeVotes = [];

        if (item.vote_ids.has(item.benefactor.get("vote_against"))) {
            removeVotes.push(item.benefactor.get("vote_against"));
        }

        if (item.vote_ids.has(item.benefactor.get("vote_for"))) {
            removeVotes.push(item.benefactor.get("vote_for"));
        }

        this.props.onChangeVotes(addVotes, removeVotes);
    }

    getHeader(benefactorTableIndex, preferredUnit) {
        return [
            benefactorTableIndex === 2
                ? null
                : {
                      title: (
                          <Translate
                              component="span"
                              content="account.votes.line"
                              style={{whiteSpace: "nowrap"}}
                          />
                      ),
                      dataIndex: "line",
                      align: "right",
                      render: item => {
                          return (
                              <span
                                  style={{
                                      textAlign: "right",
                                      paddingRight: 10,
                                      paddingLeft: 0,
                                      whiteSpace: "nowrap"
                                  }}
                              >
                                  {item
                                      ? item
                                      : counterpart.translate(
                                            "account.votes.expired"
                                        )}
                              </span>
                          );
                      }
                  },
            {
                title: (
                    <Translate
                        content="account.user_issued_assets.id"
                        style={{whiteSpace: "nowrap"}}
                    />
                ),
                dataIndex: "assets_id",
                align: "center",
                sorter: (a, b) => {
                    return a.assets_id > b.assets_id
                        ? 1
                        : a.assets_id < b.assets_id
                        ? -1
                        : 0;
                },
                render: item => {
                    return <span style={{whiteSpace: "nowrap"}}>{item}</span>;
                }
            },
            {
                title: (
                    <Translate
                        content="account.user_issued_assets.description"
                        style={{whiteSpace: "nowrap"}}
                    />
                ),
                dataIndex: "description",
                align: "left",
                sorter: (a, b) => {
                    if (a.description.name > b.description.name) {
                        return 1;
                    }
                    if (a.description.name < b.description.name) {
                        return -1;
                    }
                    return 0;
                },
                render: item => {
                    return (
                        <span>
                            <div
                                className="inline-block"
                                style={{
                                    paddingRight: 5,
                                    position: "relative",
                                    top: -1,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                <a
                                    style={{
                                        visibility:
                                            item.url &&
                                            item.url.indexOf(".") !== -1
                                                ? "visible"
                                                : "hidden"
                                    }}
                                    href={utils.sanitize(item.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon
                                        name="share"
                                        size="2x"
                                        title="icons.share"
                                    />
                                </a>
                            </div>
                            <div className="inline-block">
                                {item.name}
                                <br />
                                <LinkToAccountById
                                    account={item.benefactor_account}
                                    maxDisplayAccountNameLength={null}
                                />
                            </div>
                        </span>
                    );
                }
            },
            {
                className: "column-hide-small",
                title: (
                    <Translate
                        content="account.votes.total_votes"
                        style={{whiteSpace: "nowrap"}}
                    />
                ),
                dataIndex: "total_votes",
                align: "right",
                sorter: (a, b) => {
                    return a.total_votes - b.total_votes;
                },
                render: item => {
                    return (
                        <FormattedAsset
                            amount={item}
                            asset="1.3.0"
                            decimalOffset={5}
                            hide_asset
                            style={{whiteSpace: "nowrap"}}
                        />
                    );
                }
            },
            benefactorTableIndex === 0
                ? {
                      title: (
                          <Translate
                              content="account.votes.missing"
                              style={{whiteSpace: "nowrap"}}
                          />
                      ),
                      dataIndex: "missing",
                      align: "right",
                      sorter: (a, b) => {
                          return a.missing - b.missing;
                      },
                      render: item => {
                          return (
                              <span
                                  style={{
                                      textAlign: "right",
                                      whiteSpace: "nowrap"
                                  }}
                              >
                                  <FormattedAsset
                                      amount={Math.max(0, item)}
                                      asset="1.3.0"
                                      hide_asset
                                      decimalOffset={5}
                                  />
                              </span>
                          );
                      }
                  }
                : null,
            {
                title: (
                    <Translate
                        content="explorer.benefactors.period"
                        style={{whiteSpace: "nowrap"}}
                    />
                ),
                dataIndex: "period",
                align: "right",
                sorter: (a, b) => {
                    return (
                        new Date(a.period.startDate) -
                        new Date(b.period.startDate)
                    );
                },
                render: item => {
                    return (
                        <span style={{whiteSpace: "nowrap"}}>
                            {item.startDate} - {item.endDate}
                        </span>
                    );
                }
            },
            benefactorTableIndex === 2 || benefactorTableIndex === 0
                ? null
                : {
                      title: (
                          <Translate
                              content="account.votes.funding"
                              style={{whiteSpace: "nowrap"}}
                          />
                      ),
                      dataIndex: "funding",
                      align: "right",
                      render: item => {
                          return (
                              <span
                                  style={{
                                      textAlign: "right",
                                      whiteSpace: "nowrap"
                                  }}
                                  className="hide-column-small"
                              >
                                  {item.isExpired
                                      ? "-"
                                      : utils.format_number(
                                            item.fundedPercent,
                                            2
                                        ) + "%"}
                              </span>
                          );
                      }
                  },
            benefactorTableIndex === 2 || benefactorTableIndex === 0
                ? null
                : {
                      title: (
                          <span>
                              <Translate
                                  content="explorer.blockproducers.budget"
                                  style={{whiteSpace: "nowrap"}}
                              />
                              <div
                                  style={{
                                      paddingTop: 5,
                                      fontSize: "0.8rem"
                                  }}
                              >
                                  (<AssetName name={preferredUnit} />)
                              </div>
                          </span>
                      ),
                      dataIndex: "budget",
                      align: "right",
                      render: item => {
                          return (
                              <span
                                  style={{
                                      textAlign: "right",
                                      whiteSpace: "nowrap"
                                  }}
                              >
                                  {item.rest <= 0 ? (
                                      item.isExpired ? (
                                          "-"
                                      ) : (
                                          "0.00"
                                      )
                                  ) : (
                                      <EquivalentValueComponent
                                          hide_asset
                                          fromAsset="1.3.0"
                                          toAsset={item.preferredUnit}
                                          amount={item.rest}
                                      />
                                  )}
                              </span>
                          );
                      }
                  },
            {
                className: "column-hide-small",
                title: (
                    <span>
                        <Translate
                            content="account.votes.daily_pay"
                            style={{whiteSpace: "nowrap"}}
                        />
                        <div
                            style={{
                                paddingTop: 5,
                                fontSize: "0.8rem"
                            }}
                        >
                            (<AssetName name={preferredUnit} />)
                        </div>
                    </span>
                ),
                dataIndex: "daily_pay",
                align: "right",
                sorter: (a, b) => {
                    return a.daily_pay.daily_pay - b.daily_pay.daily_pay;
                },
                render: item => {
                    return (
                        <span
                            className={!item.proxy ? "clickable" : ""}
                            style={{whiteSpace: "nowrap"}}
                            onClick={
                                item.proxy
                                    ? () => {}
                                    : this[
                                          item.approvalState
                                              ? "onReject"
                                              : "onApprove"
                                      ].bind(this, item)
                            }
                        >
                            <EquivalentValueComponent
                                hide_asset
                                fromAsset="1.3.0"
                                toAsset={item.preferredUnit}
                                amount={item.daily_pay}
                                style={{whiteSpace: "nowrap"}}
                            />
                        </span>
                    );
                }
            },
            {
                className: "column-hide-small",
                title: (
                    <Translate
                        content="account.votes.toggle"
                        style={{whiteSpace: "nowrap"}}
                    />
                ),
                dataIndex: "toggle",
                align: "right",
                render: item => {
                    return (
                        <span
                            className={!item.proxy ? "clickable" : ""}
                            style={{whiteSpace: "nowrap"}}
                            onClick={
                                item.proxy
                                    ? () => {}
                                    : this[
                                          item.approvalState
                                              ? "onReject"
                                              : "onApprove"
                                      ].bind(this, item)
                            }
                        >
                            {!item.proxy ? (
                                <Icon
                                    name={
                                        item.approvalState
                                            ? "checkmark-circle"
                                            : "minus-circle"
                                    }
                                    title={
                                        item.approvalState
                                            ? "icons.checkmark_circle.approved"
                                            : "icons.minus_circle.disapproved"
                                    }
                                />
                            ) : (
                                <Icon
                                    name="locked"
                                    title="icons.locked.action"
                                />
                            )}
                        </span>
                    );
                }
            }
        ].filter(n => n);
    }

    getData(benefactors, voteThreshold = 0) {
        let {hasProxy, proxy_vote_ids, vote_ids} = this.props;
        vote_ids = hasProxy ? proxy_vote_ids : vote_ids;
        voteThreshold = voteThreshold || 0;
        return benefactors.map((item, index) => {
            let benefactor = item.benefactor.toJS();
            const rank = index + 1;
            let total_votes =
                benefactor.total_votes_for - benefactor.total_votes_against;
            let approvalState = vote_ids.has(benefactor.vote_for)
                ? true
                : vote_ids.has(benefactor.vote_against)
                ? false
                : null;

            let fundedPercent = 0;

            if (benefactor.daily_pay < item.rest) {
                fundedPercent = 100;
            } else if (item.rest > 0) {
                fundedPercent = (item.rest / benefactor.daily_pay) * 100;
            }

            let startDate = counterpart.localize(
                new Date(benefactor.work_begin_date + "Z"),
                {type: "date", format: "short_custom"}
            );
            let endDate = counterpart.localize(
                new Date(benefactor.work_end_date + "Z"),
                {type: "date", format: "short_custom"}
            );

            let now = new Date();
            let isExpired = new Date(benefactor.work_end_date + "Z") <= now;
            let hasStarted = new Date(benefactor.work_begin_date + "Z") <= now;
            let isProposed =
                (!isExpired && total_votes < voteThreshold) || !hasStarted;
            let isPoll = !!item.poll;
            return {
                key: benefactor.id,
                line: !isPoll && isExpired ? null : !isExpired ? rank : null,
                assets_id: benefactor.id,
                description: benefactor,
                total_votes: total_votes,
                missing: voteThreshold - total_votes,
                period: {startDate, endDate},
                funding:
                    !isPoll && (isExpired || isProposed)
                        ? null
                        : {isExpired, fundedPercent},
                daily_pay: {
                    preferredUnit: item.preferredUnit,
                    daily_pay: benefactor.daily_pay,
                    proxy: hasProxy,
                    approvalState,
                    benefactor: item.benefactor,
                    vote_ids
                },
                budget:
                    !isPoll && (isExpired || isProposed)
                        ? null
                        : {
                              rest: item.rest,
                              isExpired,
                              preferredUnit: item.preferredUnit,
                              rest: item.rest
                          },
                toggle: {
                    proxy: hasProxy,
                    approvalState,
                    benefactor: item.benefactor,
                    vote_ids
                }
            };
        });
    }

    _getMappedBenefactors(benefactors, maxDailyPayout, filterSearch) {
        let now = new Date();
        let remainingDailyPayout = maxDailyPayout;
        let voteThreshold = undefined;
        let mapped = benefactors
            .sort((a, b) => {
                // first sort by votes so payout order is correct
                return this._getTotalVotes(b) - this._getTotalVotes(a);
            })
            .map(benefactor => {
                benefactor.isOngoing =
                    new Date(benefactor.get("work_end_date") + "Z") > now &&
                    new Date(benefactor.get("work_begin_date") + "Z") <= now;
                benefactor.isUpcoming =
                    new Date(benefactor.get("work_begin_date") + "Z") > now;
                benefactor.isExpired =
                    new Date(benefactor.get("work_end_date") + "Z") <= now;
                let dailyPay = parseInt(benefactor.get("daily_pay"), 10);
                benefactor.votes =
                    benefactor.get("total_votes_for") -
                    benefactor.get("total_votes_against");
                if (remainingDailyPayout > 0 && benefactor.isOngoing) {
                    benefactor.active = true;
                    remainingDailyPayout = remainingDailyPayout - dailyPay;
                    if (remainingDailyPayout <= 0 && !voteThreshold) {
                        // remember when benefactors become inactive
                        voteThreshold = benefactor.votes;
                    }
                    benefactor.remainingPayout =
                        remainingDailyPayout + dailyPay;
                } else {
                    benefactor.active = false;
                    benefactor.remainingPayout = 0;
                }
                return benefactor;
            })
            .filter(a => {
                const name = a.get("name").toLowerCase();
                return a && name.indexOf(filterSearch) !== -1;
            })
            .sort((a, b) => {
                // sort out expired
                if (a.isExpired !== b.isExpired) {
                    return a.isExpired ? 1 : -1;
                } else {
                    return this._getTotalVotes(b) - this._getTotalVotes(a);
                }
            });
        return {
            mappedBenefactors: mapped,
            voteThreshold: voteThreshold
        };
    }

    _getTotalVotes(benefactor) {
        return (
            parseInt(benefactor.get("total_votes_for"), 10) -
            parseInt(benefactor.get("total_votes_against"), 10)
        );
    }

    _decideRowClassName(row, index) {
        return row.toggle.approvalState ? "" : "unsupported";
    }

    render() {
        let {
            benefactorTableIndex,
            preferredUnit,
            setBenefactorsLength,
            benefactorBudget,
            hideLegacyProposals,
            getBenefactorArray,
            filterSearch
        } = this.props;
        const benefactorsHeader = this.getHeader(
            benefactorTableIndex,
            preferredUnit
        );

        let benefactorArray = getBenefactorArray();
        let {mappedBenefactors, voteThreshold} = this._getMappedBenefactors(
            benefactorArray,
            benefactorBudget,
            filterSearch
        );

        const hideProposals = (filteredBenefactor, compareWith) => {
            if (!hideLegacyProposals) {
                return true;
            }

            let duplicated = compareWith.some(benefactor => {
                const isSimilarName =
                    stringSimilarity.compareTwoStrings(
                        filteredBenefactor.get("name"),
                        benefactor.get("name")
                    ) > 0.8;
                const sameId =
                    benefactor.get("id") === filteredBenefactor.get("id");
                const isNewer =
                    benefactor
                        .get("id")
                        .substr(5, benefactor.get("id").length) >
                    filteredBenefactor
                        .get("id")
                        .substr(5, benefactor.get("id").length);
                return isSimilarName && !sameId && isNewer;
            });
            const newDate = new Date();
            const totalVotes =
                filteredBenefactor.get("total_votes_for") -
                filteredBenefactor.get("total_votes_against");
            const hasLittleVotes = totalVotes < 2000000000000;
            const hasStartedOverAMonthAgo =
                new Date(filteredBenefactor.get("work_begin_date") + "Z") <=
                new Date(newDate.setMonth(newDate.getMonth() - 2));

            const manualHidden = hiddenProposals.includes(
                filteredBenefactor.get("id")
            );

            let hidden =
                ((!!duplicated || hasStartedOverAMonthAgo) && hasLittleVotes) ||
                manualHidden;

            return !hidden;
        };

        let polls = mappedBenefactors
            .filter(a => {
                let lowercase = a.get("name").toLowerCase();
                return lowercase.includes("bsip") || lowercase.includes("poll");
            })
            .map(benefactor => {
                return {
                    preferredUnit,
                    rest: benefactor.remainingPayout,
                    poll: true,
                    benefactor: benefactor
                };
            })
            .filter(a => !!a);

        // remove polls
        mappedBenefactors = mappedBenefactors.filter(a => {
            let lowercase = a.get("name").toLowerCase();
            return !lowercase.includes("bsip") && !lowercase.includes("poll");
        });

        let onGoingBenefactors = mappedBenefactors.filter(a => {
            return a.isOngoing;
        });
        let activeBenefactors = mappedBenefactors
            .filter(a => {
                return a.active && a.isOngoing;
            })
            .map(benefactor => {
                return {
                    preferredUnit,
                    rest: benefactor.remainingPayout,
                    benefactor: benefactor
                };
            })
            .filter(a => !!a);

        let newBenefactors = mappedBenefactors
            .filter(a => {
                return (
                    !a.active &&
                    !a.isExpired &&
                    hideProposals(a, onGoingBenefactors)
                );
            })
            .map(benefactor => {
                return {
                    preferredUnit,
                    rest: 0,
                    benefactor: benefactor
                };
            });

        let expiredBenefactors = benefactorArray
            .filter(a => {
                return a.isExpired;
            })
            .map(benefactor => {
                return {
                    preferredUnit,
                    rest: 0,
                    benefactor: benefactor
                };
            });
        // fixme: don't call setState in render
        setTimeout(() => {
            setBenefactorsLength(
                newBenefactors.length,
                activeBenefactors.length,
                polls.length,
                expiredBenefactors.length,
                voteThreshold
            );
        }, 250);
        const benefactors =
            benefactorTableIndex === 0
                ? newBenefactors
                : benefactorTableIndex === 1
                ? activeBenefactors
                : benefactorTableIndex === 2
                ? expiredBenefactors
                : polls;
        return (
            <PaginatedList
                className="table dashboard-table table-hover"
                rowClassName={this._decideRowClassName.bind(this)}
                rows={this.getData(benefactors, voteThreshold)}
                header={benefactorsHeader}
                pageSize={50}
                label="utility.total_x_assets"
                leftPadding="1.5rem"
            />
        );
    }
}

export default BindToChainState(BenefactorList);
