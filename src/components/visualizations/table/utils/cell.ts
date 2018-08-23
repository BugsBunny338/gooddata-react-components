// (C) 2007-2018 GoodData Corporation
import * as classNames from 'classnames';
import { colors2Object, ISeparators, numberFormat } from '@gooddata/numberjs';
import { styleVariables } from '../../styles/variables';

import {
    Align,
    ITableCellStyledLabel,
    ITableCellStyle,
    TableHeader,
    TableCellLabel,
    isAttributeCell,
    isMeasureTableHeader,
    IMeasureTableHeader,
    TableCell
} from '../../../../interfaces/Table';

import { ALIGN_LEFT, ALIGN_RIGHT } from '../constants/align';

export function getColumnAlign(header: TableHeader): Align {
    return isMeasureTableHeader(header) ? ALIGN_RIGHT : ALIGN_LEFT;
}

export function getCellClassNames(rowIndex: number, columnIndex: number, isDrillable: boolean): string {
    return classNames(
        {
            'gd-cell-drillable': isDrillable
        },
        `s-cell-${rowIndex}-${columnIndex}`,
        's-table-cell'
    );
}

export function getStyledLabel(
    header: TableHeader,
    cellContent: TableCell,
    applyColor: boolean = true,
    separators?: ISeparators
): ITableCellStyledLabel {
    if (isAttributeCell(cellContent)) {
        return {
            style: {},
            label: cellContent.name
        };
    }

    const parsedNumber: string | number = cellContent === null ? '' : parseFloat(cellContent);
    const formattedNumber: string = numberFormat(parsedNumber,
                                                (header as IMeasureTableHeader).format,
                                                undefined,
                                                separators);
    const { label: origLabel, color } = colors2Object(formattedNumber);

    let style: ITableCellStyle;
    let label: TableCellLabel;

    if (origLabel === '') {
        label = '–';
        style = {
            color: styleVariables.gdColorStateBlank,
            fontWeight: 'bold'
        };
    } else {
        style = (color && applyColor) ? { color } : {};
        label = origLabel;
    }

    return { style, label };
}
