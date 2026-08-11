/**
 * @example
 * */
const labels = [
    { label: '用户名', props: 'userName' },
    { label: '姓名', props: 'realName' },
    { label: '创建时间', props: 'createTime' },
    { label: '电话号码', props: 'phone' },
    { label: '操作', props: 'operation' }
];

export const tableColumnConfig = reactive(
    labels.map((item) => {
        const obj: ITableColumn = {
            filed: item.props,
            label: item.label,
            options: {
                sortable: true,
                align: 'center',
                showOverflowTooltip: true
            }
        };

        if (item.label === '操作') {
            obj.options!.fixed = 'right';
            obj.operations = [
                {
                    label: '编辑',
                    type: 'edit',
                    link: true
                },
                {
                    label: '删除',
                    type: 'remove',
                    link: true,
                    btnType: 'danger',
                    confirm: {
                        mode: 'popover',
                        content: '您确认要删除此用户吗？一旦删除将无法恢复。'
                    }
                },
                {
                    label: '下载',
                    type: 'download',
                    link: true,
                    btnType: 'primary',
                    confirm: {
                        mode: 'messageBox',
                        content: '是否确定下载文件'
                    }
                }
            ];
        }
        return obj;
    })
);
