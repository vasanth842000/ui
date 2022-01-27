import React from "react";
import {Tooltip, Button} from "dxperts-ui-style-guide";
import counterpart from "counterpart";
import jsPDF from "jspdf";
import "jspdf-autotable";
import BlockchainStore from "stores/BlockchainStore";
import BlockchainActions from "actions/BlockchainActions";

const printReceipt = ({data, parsePrice}) => {
    const {
        line_items,
        to,
        asset,
        from,
        total_amount,
        memo,
        currency,
        blockNum,
        to_name,
        note
    } = data;
    const marginUp = 25,
        lineMargin = 5,
        marginLeft = 15,
        transactionDataright = 150,
        width = 210,
        rowHeight = 10,
        fontSize = 16,
        totalFontSize = 20;

    let height = 0;
    let body = [];
    let transactionId = "";
    let fromName = "";

    if (from) {
        from.get("history").forEach(op => {
            if (op.get("block_num") === blockNum) {
                transactionId = op.get("id");
                return;
            }
        });
        fromName = from.get("name");
    }

    const date = BlockchainStore.getState().blockHeaders.get(blockNum);

    const timestamp = date
        ? date.timestamp.toLocaleDateString("en-US").replace(/\//g, ".")
        : new Date().toLocaleDateString("en-US").replace(/\//g, ".");

    const pdf = new jsPDF({
        orientation: "portrait",
        compressPdf: true
    });

    pdf.setFontStyle("bold");
    pdf.setFontSize(fontSize);
    pdf.text(
        counterpart.translate("invoice.pay_to", {locale: "en"}).toUpperCase(),
        marginLeft,
        (height += marginUp)
    );
    pdf.setFontStyle("normal");
    pdf.text(to_name, marginLeft, (height += rowHeight));
    pdf.text(to, marginLeft, (height += rowHeight));

    pdf.autoTable({
        body: [
            ["", counterpart.translate("invoice.memo", {locale: "en"}), memo],
            [
                {
                    content: counterpart
                        .translate("invoice.paid_by", {locale: "en"})
                        .toUpperCase(),
                    styles: {fontStyle: "bold"}
                },
                counterpart.translate("invoice.date", {locale: "en"}),
                timestamp
            ],
            [
                fromName,
                counterpart.translate("invoice.transaction", {locale: "en"}),
                transactionId
            ],
            [
                {
                    content: counterpart
                        .translate("invoice.note", {locale: "en"})
                        .toUpperCase(),
                    styles: {fontStyle: "bold"}
                },
                "",
                ""
            ],
            [note, "", ""]
        ],
        bodyStyles: {valign: "top"},
        styles: {cellWidth: "wrap", rowPageBreak: "auto", halign: "justify"},
        columnStyles: {
            0: {halign: "left", cellWidth: 90},
            1: {fontStyle: "bold"},
            2: {cellWidth: 40}
        },
        startY: (height += rowHeight),
        theme: "plain"
    });

    pdf.line(
        lineMargin,
        (height = pdf.autoTable.previous.finalY + rowHeight),
        width - lineMargin,
        height
    );

    pdf.setFontSize(totalFontSize);
    pdf.text(
        counterpart
            .translate("invoice.receipt_total", {locale: "en"})
            .toUpperCase(),
        marginLeft,
        (height += rowHeight)
    );
    pdf.text(`${total_amount} ${currency}`, transactionDataright, height);
    pdf.line(lineMargin, (height += 5), width - lineMargin, height);

    pdf.setFontStyle("normal");
    pdf.setFontSize(fontSize);
    for (let item of line_items) {
        const price = parsePrice(item.price);
        const unit = `${price} ${asset}`;
        const total = `${item.quantity * price} ${asset}`;
        body = [
            ...body,
            {descrption: item.label, unit, amount: item.quantity, total}
        ];
    }
    pdf.autoTable({
        columns: [
            {
                header: {content: "DESCRIPTION", styles: {halign: "left"}},
                dataKey: "descrption"
            },
            {header: "AMOUNT", dataKey: "amount"},
            {header: "UNIT", dataKey: "unit"},
            {header: "TOTAL", dataKey: "total"}
        ],
        body: body,
        startY: height + rowHeight,
        bodyStyles: {valign: "top"},
        styles: {cellWidth: "auto", rowPageBreak: "auto", halign: "right"},
        columnStyles: {
            descrption: {halign: "left"}
        },
        theme: "plain"
    });
    pdf.save("dxperts-receipt-" + to + ".pdf");
};
const PrintReceiptButton = ({data, parsePrice}) => {
    const tip = "tooltip.print_receipt",
        dataPlace = "left",
        buttonText = counterpart.translate("invoice.print_receipt");
    if (data.blockNum) BlockchainActions.getHeader.defer(data.blockNum);

    return (
        <Tooltip placement={dataPlace} title={counterpart.translate(tip)}>
            <Button
                type="primary"
                icon="download"
                onClick={() => printReceipt({data, parsePrice})}
            >
                {buttonText}
            </Button>
        </Tooltip>
    );
};

export default PrintReceiptButton;
