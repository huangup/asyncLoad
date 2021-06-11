/* 
 * 多条数据异步加载(3万条数据的表格在页面上全部加载):
 * 要防止页面卡顿现象，所以需要异步处理，先把3万条数据分割成二维数组(每个子数组长度500或者其他小数字)，
 * 然后利用requestAnimationFrame递归调用来插入dom，注意数据加载顺序。
 * 生成多个节点时不要全部一一插入document中去，而是利用document.createDocumentFragment()创建一个保存在内存中的document片段，
 * DocumentFragments是DOM节点，但并不是DOM树的一部分，可以认为是存在内存中的，所以将子元素插入到文档片段时不会引起页面回流。
 * 当append元素到document中时，被append进去的元素的样式表的计算是同步发生的，此时调用 getComputedStyle 可以得到样式的计算值。
 * 而 append元素到 documentFragment 中时，是不会计算元素的样式表，所以 documentFragment 性能更优。
 */

// mock
const rows = []
for (let i = 0; i < 100000; i++) {
    rows.push({
        name: '姓名_' + (i + 1),
        age: 25,
        weight: '60kg'
    })
}

// 数组再分割成多个数组(二维数组)
const splitRows = []
const pageSize = 500
const len = rows.length
for (let i = 0, j = pageSize; i < len; i += pageSize, j += pageSize) {
    if (j > len) j = len
    splitRows.push(rows.slice(i, j))
}

const tableNode = document.getElementById('table_container')

// 10万条数据的表格一次性展示，需要先把10万条数据分割成二维数组(每个子数组长度500或者其他小数字)，然后开启多个setTimeOut来同时做异步渲染，注意数据加载顺序
window.setTimeout(function() {
    let i=0;
    function insertFragment(rows){
        // 把500行拼成一块，后续多个块插入到table中
        const fragment = document.createDocumentFragment() // 优化性能，减少不必要的插入次数(重排重绘)
        rows.forEach(function (item) {
            const rowNode = document.createElement('tr')
            rowNode.innerHTML = `<td>${item.name}</td><td>${item.age}</td><td>${item.weight}</td>`
            fragment.appendChild(rowNode)
        })
        tableNode.appendChild(fragment)
        i++
        loop()
    }
    function loop(){
        if (i >= splitRows.length) return
        window.requestAnimationFrame(function () {
            insertFragment(splitRows[i])
        })
    }
    loop()
}, 0)
