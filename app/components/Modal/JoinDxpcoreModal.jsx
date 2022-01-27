import React from "react";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountActions from "actions/AccountActions";
import counterpart from "counterpart";
import {Modal, Button, Input, Select, Form} from "dxperts-ui-style-guide";
import utils from "common/utils";

class JoinDxpcoreModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState() {
        return {
            dxpcoreAccount: this.props.account,
            url: ""
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            this.props.visible !== np.visible ||
            this.state.url !== ns.url ||
            this.state.dxpcoreAccount !== ns.dxpcoreAccount
        );
    }

    onAddComittee() {
        const {dxpcoreAccount, url} = this.state;

        if (dxpcoreAccount && url) {
            AccountActions.createDxpcore({account: dxpcoreAccount, url});
        }
        this.props.hideModal();
    }

    onChangeDxpcore(account) {
        this.setState({
            dxpcoreAccount: account
        });
    }

    onUrlChanged(e) {
        this.setState({
            url: utils.sanitize(e.target.value.toLowerCase())
        });
    }

    onClose() {
        this.props.hideModal();
        this.setState(this.getInitialState(this.props));
    }

    render() {
        const {url, dxpcoreAccount} = this.state;

        return (
            <Modal
                title={counterpart.translate("modal.dxpcore.create_dxpcore")}
                visible={this.props.visible}
                onCancel={this.props.hideModal}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.onAddComittee.bind(this)}
                    >
                        {counterpart.translate("modal.dxpcore.confirm")}
                    </Button>,
                    <Button
                        key="cancel"
                        style={{marginLeft: "8px"}}
                        onClick={this.onClose.bind(this)}
                    >
                        {counterpart.translate("modal.cancel")}
                    </Button>
                ]}
            >
                <Form className="full-width" layout="vertical">
                    <AccountSelector
                        label="modal.dxpcore.from"
                        accountName={
                            (dxpcoreAccount && dxpcoreAccount.get("name")) ||
                            account.get("name")
                        }
                        account={dxpcoreAccount || account}
                        onAccountChanged={this.onChangeDxpcore.bind(this)}
                        size={35}
                        typeahead={true}
                    />
                    <Translate
                        content="modal.dxpcore.text"
                        unsafe
                        component="p"
                    />
                    <Form.Item
                        label={counterpart.translate("modal.dxpcore.url")}
                    >
                        <Input
                            value={url}
                            onChange={this.onUrlChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.dxpcore.web_example"
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default JoinDxpcoreModal;
