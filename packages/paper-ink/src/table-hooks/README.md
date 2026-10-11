# Table Hooks

独立于 Table 的浏览器业务 Hook，无新增依赖。可从 `paper-ink` 或 `paper-ink/table-hooks` 引入。Table 的 `source` 与 `selection` 接受 Hook 返回值，也接受满足相同协议的其他实现。

```tsx
const table = useBasePageTable<User, { keyword: string }>({
  defaultSearchParams: { keyword: '' },
  getTableData: async (query, signal) => {
    const response = await fetch('/api/users', {
      method: 'POST', body: JSON.stringify(query), signal,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('加载失败');
    return response.json(); // { data: User[], total: number }
  },
});
const selection = useTableChecked({
  tableData: table.tableData, setTableData: table.setTableData, idName: 'id',
});
<Table source={table} selection={selection} columns={columns} rowKey="id" />
```

## useBasePageTable

| 配置 | 默认与用途 |
| --- | --- |
| `getTableData(query, signal)` | 必填，查询为 `{ pageNum, pageSize, searchParams }`，结果为 `{ data, total, pageNum?, pageSize?, render?, meta? }` |
| `defaultPageSize` | 20，只用于非受控初始化 |
| `defaultSearchParams` | `{}`，只用于非受控初始化；有必填筛选字段时显式提供 |
| `cachePageSizeKey` | 可选，localStorage 页容量缓存，格式 `{ value: number }`；存储失败不影响请求 |
| `debounceTime` | 200ms；新查询、刷新和 deps 变化都经此等待 |
| `deps` | 额外请求依赖，数组长度保持稳定 |
| `subscribe` | `(reload) => cleanup`，更换订阅或卸载时清理 |
| `query / onQueryChange` | 成对提供受控查询，父组件回传后才发起新请求 |

返回 `pageNum`、`pageSize`、`searchParams`、`setPageNum`、`setPageSize`、`setPagination`、`setSearchParams`、`tableData`、`setTableData`、`total`、`setTotal`、`data`、`error`、`loading`、`setLoading`、`reloadTable`。

- `setPagination(pageNum, pageSize)` 一次更新；页容量变化回第一页。`setSearchParams` 也回第一页。相同分页或无效非正整数不会通知/请求。
- `setPageNum / setPageSize / setSearchParams / setTableData / setTotal` 支持值及函数更新；非受控查询连续函数更新读取最新值。
- `setTableData / setTotal` 仅更新本地展示，不请求，也不自动推算总数；保留已有 meta。
- 只允许最新请求更新结果、error 和 loading。替换查询、刷新、deps 变化及卸载会 abort 旧请求；请求忽略 signal 时仍隔离旧结果。
- 请求期间保留旧行；有效失败清空结果并提供 error，业务使用 `reloadTable()` 重试。不自动重试。
- `render:false` 忽略该结果，保留原展示；后端页码/页容量修正会更新查询并请求修正页，不在相同修正上循环。
- 请求函数身份变化不会自动请求；使用 deps 显式声明影响结果的外部依赖。查询及筛选对象遵循不可变更新约定。
- `setLoading` 是兼容业务的展示入口，不控制取消；有效请求完成会回写 loading。

## useTableChecked

`useTableChecked({ tableData, setTableData, idName })` 将选择状态写入业务行的 `_checked`，不额外存储一份 keys。`idName` 必须是 string/number 身份字段，并与 Table.rowKey 对应。

| 返回值 | 用途 |
| --- | --- |
| `setCheckedIds(ids)` | 一次更新当前行的最终选中态，未变化的行保留引用 |
| `toggleChecked(id)` | 切换单行 |
| `changeChecked(ids, checked)` | 设置指定行 |
| `handleSelectAll()` | 当前行全选/取消全选 |
| `checkedIds / checkedItems / checkedCount` | 从当前数据派生 |
| `isAllChecked / isIndeterminate` | 当前数据的全选和半选 |

`1` 与 `'1'` 是不同身份。替换数据后的选择取决于新行 `_checked`，不天然保留跨页选择。业务直接不可变更新 `_checked` 也会同步派生结果。

## 原有辅助 Hook

| Hook | 签名与行为 |
| --- | --- |
| `useReloadDataById` | `({ getTableDataById, setTableData, idName })`，返回 `async (ids) => void`；请求结果按身份合并，保留其他行，错误由调用方捕获 |
| `useGetIndexById` | `({ tableData, idName })`，返回 `(id) => number`；查找当前数据，未找到返回 -1 |
| `useCopyDataByIds` | `(tableData, setTableData, idName)`，返回 `(ids) => void`；structuredClone 深拷贝、生成新身份、清除选择，放在开头 |
| `useAddRowAtStart / useAddRowAtEnd` | `(setTableData, idName, defaults?)`，返回 `(count = 1, initialData?) => void`；生成唯一身份，初始字段覆盖 defaults |
| `useDeleteDataByIds` | `(setTableData, idName)`，返回 `(ids) => void`；删除当前匹配行 |

新增和复制的身份字段要求字符串类型；自动生成的唯一身份不被 defaults/initialData 覆盖。新增数量必须有限且正数，小数向下取整。复制数据应能被 structuredClone 处理；失败同步抛出，数据不部分更新。上述本地操作不改变 total，也不调用后端。它们便于编辑暂存行，服务端增删保存仍由业务负责。

公共类型包括 `TableQuery`、`GetTableDataResult`、`GetTableDataFn`、`TableOptions`、`UseBasePageTableReturn`、`TableRowKey`、`TableIdentityKey`、`UseTableCheckedOptions`、`UseTableCheckedReturn` 和 `UpdateGetTableDataByIdFn`。
