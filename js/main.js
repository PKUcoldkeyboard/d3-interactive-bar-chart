/**
 * 
 * @authors Pang S.Z (158505862@qq.com)
 * @date    2021-05-27 01:16:29
 * @version $0.0.1-SNAPSHOT$
 */


let svg;
//用于绘图的数据
let dataset;

//柱状图属性
let margin = { top: 20, right: 20, bottom: 80, left: 150 };
let width = 800 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;

//设置比例尺
let x = d3.scaleBand().range([0, width]).padding(0.2)
let y = d3.scaleLinear().range([height, 0])


//x轴和y轴的值
let xColumn;
let yColumn;

//页面加载时初始化
function init() {
    svg = d3.select("#vis").append("svg")
        .attr("width", 800)
        .attr("height", 400)
        .append("g")
        .attr("transform", `translate(${margin.left / 2},${margin.top})`);
}

//update按钮点击事件
function regenerate() {
    xColumn = getXSelection();
    yColumn = getYSelection();
    //console.log(xColumn);
    //console.log(yColumn);
    d3.csv("data/coffee_data.csv", (error, data) => {
        if (error) {
            console.log(error);
        } else {
            //首先清除svg
            svg.selectAll("*").remove();

            //分组聚合
            dataset = d3.nest()
                .key(d => {
                    return d[xColumn];
                })
                .rollup(d => {
                    return d3.sum(d, g => { return g[yColumn] });
                }).entries(data);

            dataset.forEach(d => {
                d[xColumn] = d.key;
                d[yColumn] = d.value;
            });

            //格式化数据
            dataset.forEach(d => {
                d[yColumn] = +d[yColumn];
            });

            //console.log(dataset);

            //使用比例尺进行缩放
            x.domain(dataset.map(function(d) { return d[xColumn]; }));
            y.domain([0, d3.max(dataset, function(d) { return d[yColumn]; })]);

            //绑定数据，添加矩形
            svg.selectAll("rect").data(dataset)
                .enter()
                .append("rect")
                .attr("x", d => {
                    return x(d[xColumn]) + margin.left / 2;
                })
                .attr("y", d => {
                    return y(d[yColumn]);
                })
                .attr("height", d => {
                    return height - y(d[yColumn]);
                })
                .attr("width", x.bandwidth())
                .attr("fill", "rgb(168,203,247)");

            //添加标签
            svg.selectAll("text").data(dataset)
                .enter()
                .append("text")
                .text(d => { return d[yColumn]; })
                .attr("x", d => {
                    return x(d[xColumn]) + x.bandwidth() / 2 + margin.left / 2;
                })
                .attr("y", d => {
                    return y(d[yColumn]) + 14;
                })
                .attr("class", "label")
                .style("fill", "#fff")
                .style("font-size", "12px")
                .attr("text-anchor", "middle");

            //x轴
            svg.append("g")
                .attr("transform", `translate(${margin.left / 2},${height})`)
                .attr("class", "axis")
                .attr("id", "xAxis")
                .call(d3.axisBottom(x))

            //x轴 title
            svg.append("text")
                .attr("transform", `translate(${margin.left / 2 + width / 2}, ${height + 50})`)
                .style("text-anchor", "middle")
                .attr("id", "xTitle")
                .style("font-size", "23px")
                .style("fill", "#7b7e8c")
                .text(xColumn);
            //y轴
            svg.append("g")
                .attr("transform", `translate(${margin.left / 2},0)`)
                .attr("class", "axis")
                .attr("id", "yAxis")
                .call(d3.axisLeft(y).ticks(5));

            //y轴 title
            svg.append("text")
                .attr("transform", `translate(0, ${height / 2}), rotate(-90)`)
                .style("text-anchor", "middle")
                .attr("id", "yTitle")
                .style("font-size", "23px")
                .style("fill", "#7b7e8c")
                .text("Coffee " + yColumn + "(USD)");

            //对比较密集的图表进行文本缩小和旋转刻度
            if (xColumn === 'state') {
                svg.selectAll(".label").style("font-size", "8px");
            }
            if (xColumn === 'type') {
                //svg.attr("transform", `translate(${margin.left},0)`);
                svg.select("#xAxis").selectAll(".tick").selectAll("text")
                    .attr("transform", "rotate(30)")
                    .attr("text-anchor", "start")
                    .style("font-size", "12px");

                //调整x轴标题位置
                svg.select("#xTitle")
                    .attr("transform", `translate(${margin.left / 2 + width / 2}, ${height + 70})`);
            }
            svg.exit().remove();
        }
    });
}

function getXSelection() {
    var node = d3.select('#xdropdown').node();
    var i = node.selectedIndex;
    return node[i].value;
}

function getYSelection() {
    var node = d3.select('#ydropdown').node();
    var i = node.selectedIndex;
    return node[i].value;
}

let sortOption = false;

function sortBars() {
    //首先清除svg
    svg.selectAll("*").remove();
    if (!dataset || xColumn != getXSelection() || yColumn != getYSelection()) {
        alert("请先点击update获取数据！");
        return;
    }
    if (sortOption) {
        sortOption = !sortOption;
        dataset.sort((a, b) => {
            return d3.ascending(a[yColumn], b[yColumn]);
        });
        //console.log(dataset);
    } else {
        sortOption = !sortOption;
        dataset.sort((a, b) => {
            return d3.descending(a[yColumn], b[yColumn]);
        });
        //console.log(dataset);
    }
    //draw
    //使用比例尺进行缩放
    x.domain(dataset.map(function(d) { return d[xColumn]; }));
    y.domain([0, d3.max(dataset, function(d) { return d[yColumn]; })]);

    //绑定数据，添加矩形
    svg.selectAll("rect").data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => {
            return x(d[xColumn]) + margin.left / 2;
        })
        .attr("y", d => {
            return y(d[yColumn]);
        })
        .attr("height", d => {
            return height - y(d[yColumn]);
        })
        .attr("width", x.bandwidth())
        .attr("fill", "rgb(168,203,247)");

    //添加标签
    svg.selectAll("text").data(dataset)
        .enter()
        .append("text")
        .text(d => { return d[yColumn]; })
        .attr("x", d => {
            return x(d[xColumn]) + x.bandwidth() / 2 + margin.left / 2;
        })
        .attr("y", d => {
            return y(d[yColumn]) + 14;
        })
        .attr("class", "label")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .attr("text-anchor", "middle");

    //x轴
    svg.append("g")
        .attr("transform", `translate(${margin.left / 2},${height})`)
        .attr("class", "axis")
        .attr("id", "xAxis")
        .call(d3.axisBottom(x))

    //x轴 title
    svg.append("text")
        .attr("transform", `translate(${margin.left / 2 + width / 2}, ${height + 50})`)
        .style("text-anchor", "middle")
        .attr("id", "xTitle")
        .style("font-size", "23px")
        .style("fill", "#7b7e8c")
        .text(xColumn);
    //y轴
    svg.append("g")
        .attr("transform", `translate(${margin.left / 2},0)`)
        .attr("class", "axis")
        .attr("id", "yAxis")
        .call(d3.axisLeft(y).ticks(5));

    //y轴 title
    svg.append("text")
        .attr("transform", `translate(0, ${height / 2}), rotate(-90)`)
        .style("text-anchor", "middle")
        .attr("id", "yTitle")
        .style("font-size", "23px")
        .style("fill", "#7b7e8c")
        .text("Coffee " + yColumn + "(USD)");

    //对比较密集的图表进行文本缩小和旋转刻度
    if (xColumn === 'state') {
        svg.selectAll(".label").style("font-size", "8px");
    }
    if (xColumn === 'type') {
        //svg.attr("transform", `translate(${margin.left},0)`);
        svg.select("#xAxis").selectAll(".tick").selectAll("text")
            .attr("transform", "rotate(30)")
            .attr("text-anchor", "start")
            .style("font-size", "12px");

        //调整x轴标题位置
        svg.select("#xTitle")
            .attr("transform", `translate(${margin.left / 2 + width / 2}, ${height + 70})`);
    }
    svg.exit().remove();
}