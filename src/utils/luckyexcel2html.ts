import { isString } from './common';

const getHtmlBorderStyle = (type: number, color: string) => {
    let style = '';
    let borderType: Record<number, string> = {
        0: 'none',
        1: 'Thin',
        2: 'Hair',
        3: 'Dotted',
        4: 'Dashed',
        5: 'DashDot',
        6: 'DashDotDot',
        7: 'Double',
        8: 'Medium',
        9: 'MediumDashed',
        10: 'MediumDashDot',
        11: 'MediumDashDotDot',
        12: 'SlantedDashDot',
        13: 'Thick'
    };
    const t = borderType[type];

    if (t.indexOf('Medium') > -1) {
        style += '2px ';
    } else if (t == 'Thick') {
        style += '1.5px ';
    } else {
        style += '0.5px ';
    }

    if (t == 'Hair') {
        style += 'double ';
    } else if (t.indexOf('DashDotDot') > -1) {
        style += 'dotted ';
    } else if (t.indexOf('DashDot') > -1) {
        style += 'dashed ';
    } else if (t.indexOf('Dotted') > -1) {
        style += 'dotted ';
    } else if (t.indexOf('Dashed') > -1) {
        style += 'dashed ';
    } else {
        style += 'solid ';
    }

    return style + color + ';';
};

const itemParams: Record<string, any> = {
    ht: {
        0: 'center',
        1: 'start',
        2: 'end'
    },
    vt: {
        0: 'center',
        1: 'flex-start',
        2: 'flex-end'
    },
    un: {
        0: 'unset',
        1: 'underline',
        2: 'underline;text-decoration-style:double'
    },
    rt: {
        0: 0,
        45: -45,
        135: 45,
        90: 270,
        180: 90
    },
    tb: {
        0: 'nowrap',
        1: 'nowrap',
        2: 'wrap'
    },
    tr: {
        0: 'unset',
        3: 'tb'
    },
    borderInfo: <Record<string, any>>{
        l: 'border-left:',
        r: 'border-right:',
        t: 'border-top:',
        b: 'border-bottom:'
    },
    border(value: Record<string, any>) {
        let str = '';

        for (const key in value) {
            if (!this.borderInfo[key]) continue;

            str +=
                this.borderInfo[key] + getHtmlBorderStyle(value[key].style, value[key].color) + ';';
        }
        return str;
    }
};

const dic = (keyValue: Record<string, any>) => {
    const obj: Record<string, any> = {
        bg: `background:${keyValue.value}`,
        // 在本地引入宋体后，同样是宋体luckysheet和html表现不一致
        ff: `font-family:${keyValue.value === '宋体' ? 'SimSun' : keyValue.value}`,
        fc: `color:${keyValue.value}`,
        bl: `font-weight:${keyValue.value ? 'bold' : 'unset'}`, //0 常规 、 1加粗
        it: `font-style:${keyValue.value ? 'italic' : 'unset'}`, //0 常规 、 1 斜体
        // 感觉excel的字体大小转到html会更小一点，所以加大一点
        fs: `font-size:${keyValue.value + 2}px`,
        tb: `white-space: ${itemParams.tb[keyValue.value]}`,
        tr: `writing-mode: ${itemParams.tr[keyValue.value]}`,
        cl: `text-decoration-line:${keyValue.value ? 'line-through' : 'unset'}`, //0 常规 、 1 删除线
        un: `text-decoration-line:${itemParams.un[keyValue.value]}`,
        ht: `text-align:${itemParams.ht[keyValue.value]};justify-content:${itemParams.ht[keyValue.value]}`, //水平居中
        vt: `align-items:${itemParams.vt[keyValue.value]}` //垂直居中---不用vertcel-align
    };

    return obj[keyValue.key];
};

// 返回样式表
const getStyle = (cell: luckysheet.CellObject, sheet: any = {}, rowIndex = -1, colIndex = -1) => {
    let str = '';
    if (!cell) return '';
    if (rowIndex !== -1 && sheet.config?.borderInfo) {
        for (const border of sheet.config.borderInfo) {
            if (border.value.row_index === rowIndex && border.value.col_index === colIndex) {
                str += itemParams.border(border.value);
                continue;
            }
        }
    } else {
        let t = '';
        Object.entries(cell).forEach(([key, value]) => {
            t = dic({ key, value });
            if (t) str += t + ';';
        });
    }

    return str;
};

/**
 * 获取当前表格的有效边界
 * */

const getClearTableData = (data: luckysheet.CellObject[][]) => {
    let validRow = 0;
    let validColumn = 0;

    const rowData = data[0];

    for (let i = rowData.length - 1; i >= 0; i--) {
        if (rowData[i]) {
            validColumn = i;
            break;
        }
    }

    // 行的数据需要在列的有效范围内均没有数据才可丢弃
    let num = 0;

    outloop: for (let i = data.length - 1; i >= 0; i--) {
        // 减少遍历次数
        num = data[i].filter((v) => !!v).length;
        if (num === 0) continue;

        for (let j = 0; j <= validColumn; j++) {
            if (data[i][j]) {
                validRow = i;
                break outloop;
            }
        }
    }

    return {
        validRow,
        validColumn: validColumn + 1
    };
};

/**
 * 修改原字符串
 */
const getText = (cell: luckysheet.CellObject) => {
    if (!cell) return '';
    let text = (cell.m ?? cell.v) || cell.ct?.s?.map((item) => item.v).join('') || '';
    text = JSON.stringify(text);

    let content;
    if (isString(text)) {
        content = text.replace('\\r\\n', '<br>');
        return JSON.parse(content);
    }

    return text;
};

/**sheet结构*/
const createTable = (sheet: luckysheet.SheetConfig) => {
    // 当一行或者一列均没有任何内容时删除
    const data = sheet.data;
    if (!data) {
        console.warn('当前无数据');
        return '';
    }

    const { validRow, validColumn } = getClearTableData(data);
    // rowlen和columnlen只会记录宽高有变化的单元格索引
    const colHeightArr = Array.from({ length: validRow }, () => sheet.defaultRowHeight || 18).map(
        (v, index) => sheet.config?.rowlen?.[index] || v
    );
    const rowWidthArr = Array.from({ length: validColumn }, () => sheet.defaultColWidth || 70).map(
        (v, index) => sheet.config?.columnlen?.[index] || v
    );

    let tr = '';

    for (let rowIndex = 0; rowIndex < validRow; rowIndex++) {
        let td = '';
        // 记录需要合并的列
        for (let colIndex = 0; colIndex < validColumn; colIndex++) {
            const cell = data[rowIndex][colIndex];

            const rowspan = cell?.mc?.rs || 1;
            const colspan = cell?.mc?.cs || 1;

            // luckysheet中，存在mc且不存在rs、cs的为被合并的行，存在rs、cs的为主单元格
            if (cell?.mc && !cell?.mc?.rs) continue;

            /**
             * 对于表格,只需要设置第一行和第一列的宽高,即可定下整个表格的单元格宽高
             * */
            td += `<td
            rowspan='${rowspan}'
            colspan="${colspan}"
            style="
            overflow:hidden;
            height:${colHeightArr[rowIndex]}px;
            width:${rowWidthArr[colIndex]}px;
            border:1px solid #d6d6d6;
            ${getStyle(cell, sheet, rowIndex, colIndex)};
            "

            >
            <div style="transform:rotate(${itemParams.rt[cell?.rt || 0]}deg);height:100%!important;width:100%!important;overflow:hidden;display:flex;
              ${getStyle(cell)};
            ">
              ${getText(cell)}
              </div>
            </td>`;
        }

        tr += `<tr>${td}</tr>`;
    }
    const str = `
      <table cellpadding="0" cellspacing="0"
      style="
      table-layout: fixed;
      border-collapse: collapse;
      ">
          <tbody>
              ${tr}
          </tbody>
      </table>
  `;

    return str;
};

export const luckyexcel2html = (sheets: any) => {
    sheets = Object.assign([], sheets);
    const htmls: string[] = [];
    sheets.forEach((sheet: luckysheet.SheetConfig) => {
        htmls.push(createTable(sheet));
    });
    return htmls;
};
