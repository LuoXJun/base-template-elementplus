import { type InjectionKey, type Ref } from 'vue';

export const getMaterialTableFields: InjectionKey<{
    itemType: Ref<ItemType[]>;
}> = Symbol();
