import React from "react";
import {connect} from "alt-react";
import ApplicationApi from "api/ApplicationApi";
import AccountStore from "stores/AccountStore";
import utils from "common/utils";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {Notification} from "dxperts-ui-style-guide";

class CreateBenefactor extends React.Component {
    constructor() {
        super();

        this.state = {
            title: null,
            start: new Date(),
            end: null,
            pay: null,
            url: "http://",
            vesting: 7
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            np.currentAccount !== this.props.currentAccount,
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    onSubmit() {
        ApplicationApi.createBenefactor(
            this.state,
            this.props.currentAccount
        ).catch(error => {
            console.log("error", error);
            let error_msg =
                error.message &&
                error.message.length &&
                error.message.length > 0
                    ? error.message.split("stack")[0]
                    : "unknown error";

            Notification.error({
                message: counterpart.translate(
                    "notifications.benefactor_create_failure",
                    {
                        error_msg: error_msg
                    }
                )
            });
        });
    }

    render() {
        console.log("state:", this.state);
        return (
            <div className="grid-block" style={{paddingTop: 20}}>
                <div className="grid-content large-9 large-offset-3 small-12">
                    <Translate
                        content="explorer.benefactors.create"
                        component="h3"
                    />
                    <form style={{maxWidth: 800}}>
                        <Translate
                            content="explorer.benefactors.create_text_1"
                            component="p"
                        />
                        <Translate
                            content="explorer.benefactors.create_text_2"
                            component="p"
                        />

                        <label>
                            <Translate content="explorer.benefactors.title" />
                            <input
                                onChange={e => {
                                    this.setState({title: e.target.value});
                                }}
                                type="text"
                            />
                        </label>
                        <Translate
                            content="explorer.benefactors.name_text"
                            component="p"
                        />
                        <div
                            style={{
                                width: "50%",
                                paddingRight: "2.5%",
                                display: "inline-block"
                            }}
                        >
                            <label>
                                <Translate content="account.votes.start" />
                                <input
                                    onChange={e => {
                                        this.setState({
                                            start: new Date(e.target.value)
                                        });
                                    }}
                                    type="date"
                                />
                            </label>
                        </div>
                        <div
                            style={{
                                width: "50%",
                                paddingLeft: "2.5%",
                                display: "inline-block"
                            }}
                        >
                            <label>
                                <Translate content="account.votes.end" />
                                <input
                                    onChange={e => {
                                        this.setState({
                                            end: new Date(e.target.value)
                                        });
                                    }}
                                    type="date"
                                />
                            </label>
                        </div>
                        <Translate
                            content="explorer.benefactors.date_text"
                            component="p"
                        />

                        <label>
                            <Translate content="explorer.benefactors.daily_pay" />
                            <input
                                onChange={e => {
                                    this.setState({pay: e.target.value});
                                }}
                                type="number"
                            />
                        </label>
                        <Translate
                            content="explorer.benefactors.pay_text"
                            component="p"
                        />

                        <label>
                            <Translate content="explorer.benefactors.website" />
                            <input
                                onChange={e => {
                                    this.setState({url: e.target.value});
                                }}
                                type="text"
                            />
                        </label>
                        <Translate
                            content="explorer.benefactors.url_text"
                            component="p"
                        />

                        <label>
                            <Translate content="explorer.benefactors.vesting_pay" />
                            <input
                                defaultValue={this.state.vesting}
                                onChange={e => {
                                    this.setState({
                                        vesting: parseInt(e.target.value)
                                    });
                                }}
                                type="number"
                            />
                        </label>
                        <Translate
                            content="explorer.benefactors.vesting_text"
                            component="p"
                        />

                        <div
                            className="button-group"
                            onClick={this.onSubmit.bind(this)}
                        >
                            <div className="button" type="submit">
                                Publish
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default CreateBenefactor = connect(CreateBenefactor, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            currentAccount: AccountStore.getState().currentAccount
        };
    }
});
