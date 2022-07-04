import accessAuth from "$lib/nodejs/accessAuth"
import getStatistics from "./_getStatistics"
import Excel from 'exceljs'

function createCurrSheet(workbook, prototypeSheet, label) {
    /*Để copy worksheet thì tạo worksheet mới rồi gán thuộc tính model của worksheet gốc cho nó
    Lưu ý là cách này cũng sẽ copy tên từ worksheet cũ, 2 worksheet trùng tên với nhau, từ đó dẫn tới "xung đột tên"
    Tạo ra lỗi "We found a problem with some content" khi mở Microsoft Excel
    https://github.com/exceljs/exceljs/issues/591#issuecomment-455425086*/
    const currWorksheet = workbook.addWorksheet()
    currWorksheet.model = Object.assign(prototypeSheet.model, {
        mergeCells: prototypeSheet.model.merges
    })
    currWorksheet.name = label
    return currWorksheet
}
function getStartCellInfos(currWorksheet) {
    const startCellInfos = []
    let rowI = 3
    while (true) {
        const startRow = currWorksheet.getRow(rowI)
        const key = startRow.getCell('X').text.trim()
        const startCellId = startRow.getCell('Y').text.trim()
        if (!key.length || !startCellId.length) break
        startCellInfos.push({
            key,
            value: currWorksheet.getCell(startCellId),
            isConst: startRow.getCell('Z').value
        })
        rowI++
    }
    return startCellInfos
}
function fillWorksheet(currWorksheet, currDataset) {
    const startCellInfos = getStartCellInfos(currWorksheet)
    for (let i = 0; i < currDataset.length; i++) {
        const data = currDataset[i]
        for (const { value: startCell, key, isConst } of startCellInfos) {
            const newRow = currWorksheet.getRow(parseInt(startCell.row) + i)
            const newCell = newRow.getCell(startCell.col)
            let newValue = data[key]
            newCell.value = isConst || !newValue ? startCell.value : newValue
            newCell.style = startCell.style
        }
    }
}
function fillWorkbook(workbook, prototypeSheet, dataset) {
    for (const { label, botAccounts } of dataset) {
        const currWorksheet = workbook.getWorksheet(label) || createCurrSheet(workbook, prototypeSheet, label)
        fillWorksheet(
            currWorksheet,
            botAccounts.map(botAccount => ({
                ...botAccount, creator: {
                    text: `${botAccount.creator.username}#${botAccount.creator.discriminator}`,
                    hyperlink: `https://discord.com/users/${botAccount.creator.id}`,
                    tooltip: `${botAccount.creator.username}#${botAccount.creator.discriminator} (${botAccount.creator.id})`
                }
            }))
        )
    }
}


async function createWorkbookFile(site) {
    let workbook = new Excel.Workbook()
    await workbook.xlsx.readFile("static/template.xlsx") //Tks https://www.programonaut.com/how-to-create-a-sveltekit-image-upload-step-by-step/
    const prototypeSheet = workbook.worksheets[0]

    fillWorkbook(workbook, prototypeSheet, await getStatistics(site, prototypeSheet.name))
    prototypeSheet.orderNo = 666 //Điền bừa một số "lớn" để đảm bảo cái này luôn ở cuối

    console.time("create workbook time")
    const re = await workbook.xlsx.writeBuffer()
    console.timeEnd("create workbook time")
    return re
}

export async function get({ params, url, request }) {
    const { site } = params
    const authResult = accessAuth({ request, url }, "text")
    if (!authResult.result) return authResult.error
    return {
        status: 200,
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${site} bot accounts (${new Date().toLocaleString()}).sj0.xlsx"` //https://stackoverflow.com/a/13308094
        },
        body: await createWorkbookFile(site)
    }
}