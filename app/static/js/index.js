"use strict"
$(document).ready(function() {
    function getReadableDate(timestamp) {
        let date = new Date(timestamp*1000)
        let year = date.getFullYear();
        let month = '0' + (date.getMonth()+1);
        let day = '0' + date.getDate();
        let hour = '0' + date.getHours();
        let minutes = '0' + date.getMinutes();
        return year + '/' + month.substr(-2) + '/' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + minutes.substr(-2);
    }
    var messager = {
        createTable: function(l) {
            let res = ' <table class="ui celled striped table"><tbody>'
            for (let one of l) {
                res += '<tr>'
                for (let e of one) {
                    res += '<td>' + e + '</td>'
                }
                res += '</tr>'
            }
            res += '</tbody></table>'
            return res;
        },
        createSummaryTable: function(records, symbol, did) {
            let buyTimes = 0
            let sellTimes = 0
            let buyValue = 0
            let buyAmount = 0
            let sellValue = 0
            let sellAmount = 0
            if (symbol.endsWith('PERP')) {
                for (let record of records) {
                    if (record[1] == 0) {
                        sellValue += record[3] * 10
                        sellTimes += 1
                        sellAmount += record[3] * 10 / record[2]
                    } else if (record[1] == 1) {
                        buyValue += record[3] * 10
                        buyAmount += record[3] * 10 / record[2]                        
                        buyTimes += 1
                    }
                }
            } else {
                for (let record of records) {
                    if (record[1] == 0) {
                        sellValue += record[2] * record[3]
                        sellAmount += record[3]
                        sellTimes += 1
                    } else if (record[1] == 1){
                        buyValue += record[2] * record[3]
                        buyAmount += record[3]
                        buyTimes += 1
                    }
                }
            }
            let totalValue = (buyValue - sellValue).toFixed(0)
            let profit = 0
            profit = sellValue - buyValue + (buyAmount - sellAmount) * records[records.length-1][2]
            let template = ' <table class="ui celled striped table"><tbody>'
            template += '<tr><td>symbol</td><td>' + symbol + '</td></tr>'
            template += '<tr><td>DID</td><td>' + did + '</td></tr>'
            template += '<tr><td>Size</td><td>' + totalValue + '</td></tr>'
            template += '<tr><td>Times</td><td>' + Math.min(buyTimes, sellTimes) + '</td></tr>'
            template += '<tr><td>Profit</td><td>' + profit.toFixed(2) + '</td></tr>'
            template += '</tbody></table>'
            return template
        },
        createOneRecord: function(data, symbol, did) {
            let template = '<div class="ui record">'
            template += this.createSummaryTable(data, symbol, did)
            template += ' <table class="ui celled striped table"><tbody>'
            let dataSize = data.length;
            for (let i = dataSize-1; i >= 0; i -= 1) {
                let one = data[i]
                template += '<tr>'
                template += '<td>' + getReadableDate(one[0]) + '</td>'
                let ot = 'BUY'
                let rate = (one[4]*100).toFixed(2) + '%'
                if (one[1] == 0) {
                    ot = 'SELL'
                } else if (one[1] == -1) {
                    ot = 'START'
                    rate = ''
                } else if (one[1] == -2) {
                    ot = 'END'
                    rate = ''
                }
                template += '<td>' + ot + '</td>'
                template += '<td>' + one[2] + '</td>'
                template += '<td>' + one[3] + '</td>'
                template += '<td>' + rate + '</td>'
                template += '</tr>'
            }
            template += '</tbody></table></div>'
            return template
        },
        createRecordsTable: function(data) {
            let didDict = {};
            let template = ''
            let symbolDict = {}
            for (let d of data) {
                let did = d['did']
                if (didDict[did] == undefined) {
                    didDict[did] = []
                }
                symbolDict[did] = d.symbol
                didDict[did].push([d.time, d.ot, d.price, d.amount, d.rate])
            }
            for (let did in didDict) {
                template += this.createOneRecord(didDict[did], symbolDict[did], did)
            }
            $('#records').html(template)
        },
        createOneArbiRecord: function(data, did) {
            let template = '<div class="ui record">'
            template += ' <table class="ui celled striped table"><tbody>'
            template += '<th><tr><td>Symbol</td><td>' + did + '</td></tr></th>'
            for (let i = 0; i < data.length; i += 1) {
                let one = data[i]
                template += '<tr>'
                template += '<td>' + getReadableDate(one[0]) + '</td>'
                template += '<td>' + one[1] + '</td>'
                template += '</tr>'
            }
            template += '</tbody></table></div>'
            return template
        },
        createArbiTable: function(data) {
            let didDict = {};
            let template = ''
            for (let d of data) {
                let did = d['did']
                if (didDict[did] == undefined) {
                    didDict[did] = []
                }
                didDict[did].push([d.time, d.info])
            }
            for (let did in didDict) {
                template += this.createOneArbiRecord(didDict[did], did)
            }
            $('#records').html(template)
        },
        addStrategyMessange : function(data) {
            let template = '<div class="ui card"><div class="content">'
            template += '<div class="header">' + data.name + '</div>';
            template += '<div class="ui description"><table class="ui celled striped table"><tbody>'
            for (let key in data) {
                template += '<tr><td>' + key + '</td><td>'
                if (key == 'start_time') {
                    template += getReadableDate(data[key])
                } else {
                    template += data[key]
                }
                template += '</td></tr>'
            }
            template += '</tbody></table></div></div><div class="extra content"><button class="ui blue button">Get Records</button><button class="ui red button">Remove</button></div></div>';
            let myMessage = $(template);
            let buttons = myMessage.find('.button')
            buttons.eq(1).on('click', ()=>{
                myMessage.remove();
                linker.postMethod('delstrategy', {id: data.id}, d=>{
                    console.log(d)
                })
            })
            buttons.eq(0).on('click', ()=>{
                linker.postMethod('dbrecords', {name: data.name}, df=>{
                    if (data.name == 'arbitrage') {
                        this.createArbiTable(df)
                    } else {
                        this.createRecordsTable(df)
                    }
                })
            })
            $('#strategies').append(myMessage);
        },
        init: function() {
            $('#rfspotbalance').on('click', ()=>{
                linker.getMethod('spotbalance', data=>{
                    let tempList = ''
                    for (let oneCoin in data) {
                        if (oneCoin == 'NFT') continue
                        tempList += '<div class="ui labels"><label class="ui label">' + oneCoin.toUpperCase() + '</label>';
                        if (data[oneCoin].frozen != 0) {
                            tempList += '<label class="ui orange basic label">' + data[oneCoin].frozen + '</label>';
                        }
                        if (data[oneCoin].available != 0) {
                            tempList += '<label class="ui green basic label">' + data[oneCoin].available + '</label>';
                        }
                        tempList += '</div>';
                    }
                    $('#spotBalanceBoard').html(tempList)
                })
            })
            $('#rfbalance').on('click', ()=>{
                linker.getMethod('balance', data=>{
                    let tempList = ''
                    for (let oneCoin in data) {
                        tempList += '<div class="ui labels"><label class="ui label">' + oneCoin.toUpperCase() + '</label>';
                        if (data[oneCoin].frozen != 0) {
                            tempList += '<label class="ui orange basic label">' + data[oneCoin].frozen.toFixed(4) + '</label>';
                        }
                        if (data[oneCoin].available != 0) {
                            tempList += '<label class="ui green basic label">' + (data[oneCoin].frozen + data[oneCoin].available).toFixed(4) + '</label>';
                        }
                        tempList += '</div>';
                    }
                    $('#balanceBoard').html(tempList)
                })
            })
            $('#rfmbalance').on('click', ()=>{
                linker.getMethod('mbalance', data=>{
                    let tempList = ''
                    for (let oneCoin in data) {
                        tempList += '<div class="ui labels"><label class="ui label">' + oneCoin.toUpperCase() + '</label>';
                        if (data[oneCoin].frozen != 0) {
                            tempList += '<label class="ui orange basic label">' + data[oneCoin].frozen.toFixed(4) + '</label>';
                        }
                        if (data[oneCoin].available != 0) {
                            tempList += '<label class="ui green basic label">' + (data[oneCoin].frozen + data[oneCoin].available).toFixed(4) + '</label>';
                        }
                        tempList += '</div>';
                    }
                    $('#mbalanceBoard').html(tempList)
                })
            })
            $('#rfStrategies').on('click', ()=>{
                linker.getMethod('strategies', data=>{
                    $('#strategies').html('')
                    $('#records').html('')
                    let nameDict = {}
                    for (let d of data) {
                        if (nameDict[d.name] == undefined) {
                            this.addStrategyMessange(d)
                            nameDict[d.name] = 1
                        }
                    }
                })
            })
            $('#rfdb').on('click', ()=>{
                linker.getMethod('dbcols', data=>{
                    let myTable = this.createTable(data)
                    $('#dbstats').html(myTable)
                })
            })
            $('#cldb').on('click', ()=>{
                linker.getMethod('cleardatabase', data=>{
                    console.log(data)
                })
            })
        }
    }

    var searcher = {
        target_name: '',
        createOneCard: function(info) {  
            let regex = /\!.*?\↵↵/g;
            let newStr = info['body'].replace(regex, '');
            //let regex1 = /![[\s\S]*?]/g;
            //newStr = newStr.replace(regex1, '');
            //let regex2 = /<center[\s\S]*?center>/g;
            //newStr = newStr.replace(regex2, '');
            //let regex3 = /<a[\s\S]*?a>/g;
            //newStr = newStr.replace(regex3, '');
            //let regex4 = /\(https[\s\S]*?\)/g
            //newStr = newStr.replace(regex4, '');
            let res = '<div class="ui card"><div class="content"><div class="header">' + info['created'] + '</div>'
            res += '<div class="description"><p>' + newStr +'</p></div></div>'
            res += '<div class="extra content">' + info['title'] + '</div>'
            res += '<div class="extra content">' + info['personality'] + '</div>'
            res += '<div class="extra content">' + info['reflection'] + '</div>'
            res += '</div>'
            return res
        },
        createCards: function(data) {
            let cardsText = ''
            console.log(data)
            for (let d of data) {
                let card = this.createOneCard(d)
                cardsText += card
            }
            $('#ucards').html(cardsText)
        },
        init: function() {
            $('#userdropdown').dropdown({
                apiSettings: {
                    cache: false,
                    url: '/users?q={query}',
                    onResponse: function(response) {
                        var results = [];
                        $.each(response.data, function(index, item) {
                            results.push({
                                name: item.name,
                                value: item.code,
                                text: item.name
                            });
                        });
                        return {
                            success: true,
                            results: results
                        };
                    }
                },
                fields: {
                    remoteValues: 'results',
                    name: 'name',
                    value: 'value',
                    text: 'text'
                },
                onChange: function(value, text, $choice) {
                    searcher.target_name = value
                },
            });
            $('#getdata').on('click', d=>{
                let url = '/user?q={query}'
                let query = searcher.target_name
                let newUrl = url.replace('{query}', encodeURIComponent(query));
                linker.getMethod(newUrl, da=>{
                    searcher.createCards(da.data,da.persona)
                    tagCloud.createTags(da.data)
                    storyBoard.createStory()
                })
            })
        }
    }

    var tagCloud = {
        createTags: function(data) {
            let counts = {}
            for (let d of data) {
                let tl = d[4].split(' ')
                for (let word of tl) {
                    if (counts[word] == undefined) {
                        counts[word] = 1
                    } else {
                        counts[word] += 1
                    }
                }
            }
            $('#sidesvg').attr('width', 300).attr('height', 900)
            const words = [];
            for (let word in counts) {
                if (counts[word] > 10) {
                    words.push({
                        'text': word,
                        'size': counts[word]/5
                    })
                }
            }

            const layout = d3.layout.cloud()
                .size([400, 900])
                .words(words)
                .padding(5)
                // .rotate(() => ~~(Math.random() * 2) * 90)
                .font("Impact")
                .fontSize(d => d.size)
                .on("end", draw);

            layout.start();
            function draw() {
                d3.select("#sidesvg").select('g').remove()
                d3.select("#sidesvg")
                    .append("g")
                    .attr("transform", "translate(150,450)")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", d => d.size + "px")
                    .style("font-family", "Impact")
                    .style("fill", "#69b3a2")
                    .attr("text-anchor", "middle")
                    .attr("transform", d => `translate(${[d.x, d.y]})`)
                    .text(d => d.text)
                    .on("mouseover", function(event, d) {
                        d3.select(this).style("fill", "#ff6347");
                    })
                    .on("mouseout", function(event, d) {
                        d3.select(this).style("fill", "#69b3a2");
                    });
                }
        }
    }

    var storyBoard = {
        createStory: function() {
                const events = [
                { date: new Date(2020, 0, 1), title: "Event 1", description: "Description of event 1" },
                { date: new Date(2020, 2, 15), title: "Event 2", description: "Description of event 2" },
                { date: new Date(2020, 5, 30), title: "Event 3", description: "Description of event 3" },
                { date: new Date(2020, 8, 20), title: "Event 4", description: "Description of event 4" },
                { date: new Date(2020, 11, 10), title: "Event 5", description: "Description of event 5" }
            ];

            const margin = {top: 20, right: 20, bottom: 30, left: 40};
            const width = 960 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            // 创建时间比例尺
            const x = d3.scaleTime()
                .domain(d3.extent(events, d => d.date))
                .range([0, width]);

            // 创建轴
            const xAxis = d3.axisBottom(x);

            // 创建 SVG 容器
            const svg = d3.select(".timeline").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // 添加轴
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // 添加时间线
            svg.append("line")
                .attr("class", "line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", height / 2)
                .attr("y2", height / 2);

            // 添加事件
            const eventGroups = svg.selectAll(".event")
                .data(events)
                .enter().append("g")
                .attr("class", "event")
                .attr("transform", d => "translate(" + x(d.date) + "," + (height / 2) + ")");

            eventGroups.append("circle")
                .attr("r", 5);

            eventGroups.append("text")
                .attr("y", -10)
                .attr("x", 10)
                .style("text-anchor", "start")
                .text(d => d.title);

            // 事件的悬停效果
            eventGroups.on("mouseover", function(event, d) {
                d3.select(this).select("text").text(d.title + ": " + d.description);
            }).on("mouseout", function(event, d) {
                d3.select(this).select("text").text(d.title);
            });
        }
    }

    var linker = {
        getMethod: function(url, callback) {
            $.ajax
              ({
                type: "GET",
                url: url,
                dataType: 'json',
                async: false,
                success: function (d){
                    if (callback) {
                        callback(d);
                    }
                }
            });
        },
        postMethod: function(url, data, callback) {
            $.ajax
              ({
                type: "POST",
                url: url,
                dataType: 'json',
                async: false,
                data: data,
                success: function (d){
                    if (callback) {
                        callback(d);
                    }
                }
            });
        }
    }

    var fee = {
        init: function() {
            $('#rffee').on('click', ()=>{
                linker.getMethod('/fee', data=>{
                    this.anaData(data)
                })
            })
            $('#rfmfee').on('click', ()=>{
                linker.getMethod('/mfee', data=>{
                    this.anaData(data)
                })
            })
        },
        anaData: function(data) {
            let first = []
            for (let i = 0; i < 19; i += 1) {
                first.push(data[i])
            }
            let second = []
            for (let j = data.length-1; j > data.length-20; j -= 1) {
                second.push(data[j])
            }
            $('#feetable1').html(this.createTable(first))
            $('#feetable2').html(this.createTable(second))
            $('.feelabel').on('click', d=>{
                let symbol = d.target.innerHTML
                linker.postMethod('/feehistory', {symbol: symbol}, d=>{
                    this.createFeeTable(d)
                })
            })
        },
        createFeeTable: function(data) {
            let template = '<table class="ui celled striped table">'
            template += '<thead><tr><th>' + data[0].symbol + '</th><th>AVG1</th><th>AVG2</th><th>AVG3</th></tr>'
            template += '<tr><th>Time</th><th>Funding Rate</th><th>Month Funding Rate</th><th>Mark Price</th></thead><tbody>'
            let feeSum = 0;
            let priceSum = 0
            let count = 0;
            for (let d of data) {
                template += '<tr><td>' + getReadableDate(d.fundingTime/1000) + '</td>'
                let dayRate = d.fundingRate * 300
                feeSum += dayRate
                template += '<td>' + (dayRate).toFixed(4) + '%</td>'
                template += '<td>' + (dayRate * 30).toFixed(4) + '%</td>'
                template += '<td>' + d.markPrice + '</td>'
                priceSum += parseFloat(d.markPrice)
                count += 1;
            }
            template += '</tbody></table>'
            let avg1 = (feeSum/count).toFixed(4)
            let avg2 = (avg1 * 30).toFixed(4)
            let avg3 = (priceSum/count).toFixed(4)
            let ts = template.replace('AVG1', avg1).replace('AVG2', avg2).replace('AVG3', avg3)
            $('#feetable3').html(ts)
        },
        createTable: function(data) {
            let template = ' <table class="ui celled striped table">'
            template += '<thead><tr><th>Symbol</th><th>Funding Rate</th><th>Month Rate</th><th>Mark Price</th><th>Index Price</th><th>Dist</th></tr></thead><tbody>'
            for (let d of data) {
                template += '<tr><td><a class="ui label feelabel">' + d.symbol + '</a></td>'
                let dayRate = d.fee * 300
                template += '<td>' + (dayRate).toFixed(4) + '%</td>'
                template += '<td>' + (dayRate * 30).toFixed(4) + '%</td>'
                template += '<td>' + d.markPrice + '</td>'
                template += '<td>' + d.indexPrice + '</td>'
                template += '<td>' + ((d.markPrice - d.indexPrice)/d.markPrice * 100).toFixed(2) + '%</td>'
            }
            template += '</tbody></table>'
            return template
        }
    }

    messager.init();
    $('.checkbox').checkbox({
        onChecked: function() {
            $('#setting').show();
        },
        onUnchecked: function() {
            $('#setting').hide();
        }
    })
    $('.dropdown').dropdown({
        allowAdditions: true,
    });
    $('.menu .item').tab();
    searcher.init()
});