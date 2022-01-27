import React from "react";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountActions from "actions/AccountActions";
import counterpart from "counterpart";
import {Modal, Button, Input, Select, Form} from "dxperts-ui-style-guide";
import Icon from "../Icon/Icon";
import {PublicKey} from "dxpertsjs";
import utils from "common/utils";

class JoinBlockproducerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState(props) {
        return {
            blockproducerAccount: props.account,
            signingKey: "",
            url: ""
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            this.state.url !== ns.visible ||
            this.props.visible !== np.visible ||
            this.state.signingKey !== ns.signingKey ||
            this.state.blockproducerAccount !== ns.blockproducerAccount
        );
    }

    onAddBlockproducer() {
        const {blockproducerAccount, signingKey, url} = this.state;

        if (blockproducerAccount && signingKey) {
            AccountActions.createBlockproducer({
                account: blockproducerAccount,
                url,
                signingKey
            });
        }
        this.props.hideModal();
    }

    onChangeDxpcore(account) {
        this.setState({
            blockproducerAccount: account
        });
    }

    onMemoKeyChanged(e) {
        this.setState({
            signingKey: e.target.value
        });
    }

    onUrlChanged(e) {
        this.setState({
            url: utils.sanitize(e.target.value.toLowerCase())
        });
    }

    isValidPubKey = value => {
        return !PublicKey.fromPublicKeyString(value);
    };

    render() {
        const {blockproducerAccount, signingKey, url} = this.state;

        return (
            <Modal
                title={counterpart.translate(
                    "modal.blockproducer.create_blockproducer"
                )}
                onCancel={this.props.hideModal}
                visible={this.props.visible}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.onAddBlockproducer.bind(this)}
                    >
                        {counterpart.translate("modal.blockproducer.confirm")}
                    </Button>,
                    <Button
                        key="cancel"
                        style={{marginLeft: "8px"}}
                        onClick={this.props.hideModal}
                    >
                        {counterpart.translate("modal.cancel")}
                    </Button>
                ]}
            >
                <Form className="full-width" layout="vertical">
                    <AccountSelector
                        label="modal.blockproducer.blockproducer_account"
                        accountName={
                            (blockproducerAccount &&
                                blockproducerAccount.get("name")) ||
                            account.get("name")
                        }
                        account={blockproducerAccount}
                        onAccountChanged={this.onChangeDxpcore.bind(this)}
                        size={35}
                        typeahead={true}
                    />
                    <Translate
                        content="modal.blockproducer.text"
                        unsafe
                        component="p"
                    />
                    <Form.Item
                        label={counterpart.translate("modal.blockproducer.url")}
                    >
                        <Input
                            value={url}
                            onChange={this.onUrlChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.blockproducer.web_example"
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        label={counterpart.translate(
                            "modal.blockproducer.public_signing_key"
                        )}
                    >
                        {this.isValidPubKey(signingKey) ? (
                            <label
                                className="right-label"
                                style={{
                                    marginTop: "-30px",
                                    position: "static"
                                }}
                            >
                                <Translate content="modal.blockproducer.invalid_key" />
                            </label>
                        ) : null}

                        <Input
                            addonBefore={
                                <Icon name="key" title="icons.key" size="1x" />
                            }
                            value={signingKey}
                            onChange={this.onMemoKeyChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.blockproducer.enter_public_signing_key"
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default JoinBlockproducerModal;
