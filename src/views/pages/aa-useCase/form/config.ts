const checkNumber = (rule: any, value: any, callback: any) => {
    if (!value) callback(new Error('必填项'));
    else {
        if (typeof parseFloat(value) === 'number') callback();
        else callback(new Error('排序请输入数字'));
    }
};
export const formConfig = ref<IformItem[]>([
    {
        filed: 'input',
        label: '输入框-文本',
        type: 'input',
        rules: [{ required: true, validator: checkNumber, trigger: 'blur' }],
        description: {
            content: '这里可以看见描述',
            placement: 'right-start',
            trigger: 'hover'
        }
    },
    {
        filed: 'input',
        label: '输入框-密码',
        type: 'password'
    },
    {
        filed: 'input',
        label: '输入框-输入框',
        type: 'textarea'
    },
    {
        filed: 'select',
        label: '下拉框',
        type: 'select',
        span: 12,
        useLayout: false,
        select: {
            options: [
                { label: '下拉选项1', value: '1' },
                { label: '下拉选项2', value: '2' }
            ]
        }
    },
    {
        filed: 'select-tree',
        label: '树形下拉框',
        type: 'treeSelect',
        span: 12,
        useLayout: false,
        treeSelect: {
            data: [
                { label: '树形下拉1', value: 1 },
                { label: '树形下拉2', value: 2, children: [{ label: '树形下拉2-1', value: '2-1' }] }
            ]
        }
    },
    {
        filed: 'radio',
        label: '单选',
        type: 'radio',
        span: 12,
        useLayout: false,
        radio: {
            options: [
                { label: '单选选项1', value: '1' },
                { label: '单选选项2', value: '2' }
            ]
        }
    },
    {
        filed: 'radio-group',
        label: '单选组',
        type: 'radio-group',
        span: 12,
        useLayout: false,
        radio: {
            options: [
                { label: '单选组选项1', value: '1' },
                { label: '单选组选项2', value: '2' }
            ]
        }
    },
    {
        filed: 'checkbox',
        label: '多选框',
        type: 'checkbox',
        span: 24,
        useLayout: false,
        checkbox: {
            options: [
                { label: '多选框选项1', value: '1' },
                { label: '多选框选项2', value: '2' }
            ]
        }
    },
    {
        filed: 'date',
        label: '日期选择',
        type: 'date',
        span: 12,
        useLayout: false
    },
    {
        filed: 'daterange',
        label: '日期范围选择',
        type: 'daterange',
        span: 12,
        useLayout: false
    },
    {
        filed: 'slot',
        label: '自定义插槽',
        type: 'slot',
        span: 24,
        useLayout: false,
        description: {
            content: '这里可以看见描述',
            placement: 'right-start',
            trigger: 'hover'
        }
    }
]);
