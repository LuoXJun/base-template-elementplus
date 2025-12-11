const labels = [
    { label: '列1', props: 'num1' },
    { label: '列3', props: 'num2' },
    { label: '列2', props: 'num3' },
    { label: '操作', props: 'operation' }
];

export const tableColumnConfig = labels.map((item) => {
    const obj: ITableColumn = {
        filed: item.props,
        label: item.label,
        options: {
            align: 'center',
            showOverflowTooltip: true
        }
    };

    return obj;
});
