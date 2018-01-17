/**
 * Created by linchunhui on 15/12/26.
 * Version 2.0.00
 * Desc 新增了click事件，radio，checkbox等。
 * 在 NLTable 中，新增了：
 *      checkAll: function()
 *      getSelected: function(getId)
 *
 */

angular.module('nlTables', [])
    .directive('nlTables', function() {
        return {
            restrict: 'EA',
            scope: {
                table: "=",
                showTableIndex: "@",
                checkbox: "@",
                radio: "@"
            },
            controller: function($scope) {
                $scope.getColumnHtml = function(column, row) {
                    return (column.format ? column.format(row) : row[column.name]);
                };
                $scope.tdClick = function(column, row) {
                    return column.click == undefined ? undefined : column.click(row);
                };
                $scope.changeRadio = function(changeRow) {
                    if (changeRow.selected) {
                        angular.forEach($scope.table.data, function(row) {
                            if (!angular.equals(row, changeRow)) {
                                row.selected = false;
                            }
                        });
                    }
                }
            },
            template:
            "<div><table class='table table-striped table-hover table-bordered table-vmiddle table-condensed'>" +
            "   <thead>" +
            "       <tr>" +
            "           <td ng-if='showTableIndex'>#</td>" +
            "           <td ng-show='checkbox' class='text-center' ng-click='table.checkAll()' style='cursor: pointer;'>全选</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
            "           <td ng-show='radio' class='text-center' style='cursor: pointer;'>选择</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
            "           <td ng-repeat='column in table.columns' class='{{column.class}}'>{{column.title}}</td>" +
            "       </tr>" +
            "   </thead>" +
            "   <tbody>" +
            "       <tr ng-if='table.data == undefined || table.data.length == 0'>" +
            "           <td class='text-center tr-no-data' colspan='{{table.columns.length + 1}}'>" +
            "               <span>{{table.tip.notFoundRecord}}</span>" +
            "           </td>" +
            "       </tr>" +
            "       <tr ng-if='table.data.length > 0' ng-repeat='row in table.data'>" +
            "           <td ng-if='showTableIndex'>{{$index + 1}}</td>" +
            "           <td ng-show='checkbox | radio' class='text-center'><input type='checkbox' ng-click='radio ? changeRadio(row) : undefined' ng-model='row.selected'></td>" +
            "           <td ng-repeat='column in table.columns' class='{{column.class}}' " +
            "               ng-bind-html='getColumnHtml(column, row)|trustAsHtml' ng-click='tdClick(column, row)'></td>" +
            "       </tr>" +
            "   </tbody>" +
            "</table></div>",
            replace: true
        };
    })
    .directive('nlTurnPage', function() {
        return {
            restrict: 'EA',
            scope: {
                table: "="
            },
            template:
            "<ul class='pagination'>" +
            "   <li><span>一共 {{table.rows}} 条记录，每页 {{table.pageSize}} 条，共 {{table.pageCount}} 页</span></li>" +
            "   <li ng-class='{disabled:(table.pageNo == 1) }'>" +
            "       <a ng-click='table.pre()'><span aria-hidden='true'>&laquo;</span></a>" +
            "   </li>" +
            "   <li ng-repeat='i in table.pages' ng-class='{active:(i.index == table.pageNo)}'>" +
            "       <a ng-click='table.go(i.index)'>{{i.text}}</a>" +
            "   </li>" +
            "   <li ng-class='{disabled:(table.pageNo == table.pageCount) }'>" +
            "       <a ng-click='table.next()' ><span aria-hidden='true'>&raquo;</span></a>" +
            "   </li>" +
            "</ul>",
            replace: true
        };
    })
    .factory("NLTables", function() {
        return NLTables;
        /**
         * 初始化
         * @param columns 字段
         * @param callFunction 当页面跳转时触发的方法
         * @param injectParam 拦截的参数
         * @returns {{columns: *, pageSize: number, splitPages: number, pageCount: number, pageNo: number, nextPage: *, prePage: *, tip: {notFoundRecord: string}, go: nltable."go", refresh: nltable."refresh", build: nltable."build", next: nltable."next", pre: nltable."pre", checkAll: nltable.checkAll, getSelected: nltable.getSelected, pages: Array}}
         * @constructor
         */
        function NLTables(columns, callFunction, injectParam){
            var nltable = {
                "columns": columns,
                "pageSize": injectParam.pageSize,
                "splitPages": 2,
                "pageCount": 0,
                "pageNo": 0,
                "nextPage": injectParam ? injectParam.pageNo || 1 : 1,
                "prePage": injectParam ? injectParam.pageNo || 1 : 1,
                "tip": {
                    "notFoundRecord": "未找到记录"
                },
                "go": function(pageNo) {
                    if (this.pageNo == pageNo) return;
                    this.pageNo = pageNo;
                    var t = this;
                    if(injectParam){
                        injectParam.pageNo = pageNo;
                    }
                    callFunction(injectParam || {},
                        function(data) {
                            t = angular.extend(t, data);
                            t.build();
                        }
                    );
                },
                "refresh": function() {
                    var t = this;
                    callFunction(injectParam || {},
                        function(data) {
                            t.isCheckAll = false;
                            t = angular.extend(t, data);
                            t.build();
                        }
                    );
                },
                "build": function() {
                    var pageCount = Math.ceil(this.rows / this.pageSize);
                    this.pageCount = pageCount == 0 ? 1 : pageCount;
                    var p = new Array();
                    this.splitPages = this.splitPages <= 3 ? 3 : this.splitPages;

                    var index = 0;
                    for (var i = 0; i < pageCount; i++) {
                        if (i != 0 && i + 2 <= this.pageNo - this.splitPages) {
                            p[index] = {
                                "index": this.pageNo - this.splitPages * 2 - 1,
                                "text": "……"
                            };
                            i = this.pageNo - this.splitPages - 2;
                        } else if (i == this.pageNo + this.splitPages && i + 1 != this.pageCount) {
                            p[index] = {
                                "index": i + 1 + this.splitPages,
                                "text": "……"
                            };
                            i = pageCount - 2;
                        } else {
                            p[index] = {
                                "index": i + 1,
                                "text": (i + 1)
                            };
                        }
                        index++;
                        if (index > 20) break;
                    }
                    this.pages = p;
                    this.nextPage = this.pageNo + 1 > pageCount ? pageCount : this.pageNo + 1;
                    this.prePage = this.pageNo == 1 ? 1 : this.pageNo - 1;
                },
                "next": function(){
                    if (this.pageNo + 1 > this.pageCount) return;
                    this.go(this.pageNo + 1);
                },
                "pre": function() {
                    if (this.pageNo == 1) return;
                    this.go(this.pageNo - 1);
                },
                checkAll: function() {
                    if (this.data == undefined) {
                        return;
                    }
                    if (this.isCheckAll != true) {
                        this.isCheckAll = true;
                    } else {
                        this.isCheckAll = false;
                    }
                    for (var i = 0; i < this.data.length; i++) {
                        var data = this.data[i];
                        if (data) {
                            data.selected = this.isCheckAll;
                        }
                    }
                },
                getSelected: function(getId) {
                    var selectedRows = [];
                    angular.forEach(this.data, function(row) {
                        if (row.selected) {
                            selectedRows.push(getId(row));
                        }
                    });
                    return selectedRows;
                },
                "pages": []
            };
            nltable.go(injectParam ? injectParam.pageNo || 1 : 1);
            return nltable;
        }
    });