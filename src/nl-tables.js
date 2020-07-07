/**
 * Created by linchunhui on 15/12/26.
 * Version 2.1.1
 * Desc 新增了click事件，radio，checkbox等。
 * 在 NLTable 中，新增了：
 *      checkAll: function()
 *      getSelected: function(getId)
 *      // 单个选框触发
 *      checkboxChange: function(row, trIndex)
 *
 * 调用方法：
 *  表格:
 *      <div nl-tables table="table" radio="true" class="table-responsive"></div>
 *      必填属性：
 *      table: $scope的NLTable实例， 默认: table
 *
 *      可选属性：
 *      radio: true/false
 *      checkbox: true/false
 *      show-table-index: true/false
 *
 *  翻页：
 *      <div nl-turn-page table="table"></div>
 */
angular.module('nlTables', [])
    .directive('nlTables', function(StringUtils) {
        return {
            restrict: 'EA',
            scope: {
                table: "=",
                selectedRow: "=",
                selectRow: "&",
                showTableIndex: "@",
                checkbox: "@",
                radio: "@",
                unselected: "@",
                selectRowFlag: "@"
            },
            controller: function($scope) {
                $scope.autoUnselected = $scope.unselected == undefined || $scope.unselected == '' ? true : Boolean.valueOf($scope.unselected);
                $scope.selectedFlag = $scope.selectRowFlag == undefined ? false : $scope.selectRowFlag == '' ? true : Boolean.valueOf($scope.selectRowFlag);

                $scope.getColumnHtml = function(column, row) {
                    return (column.format ? column.format(row) : row[column.name]);
                };
                $scope.getCountColumnHtml = function(column, row) {
                    return column.countFormat?column.countFormat(row):StringUtils.isEmpty(column.countColumn)?'':row[column.countColumn];
                };
                $scope.tdClick = function(column, row, columnIndex, trIndex) {
                    if ($scope.hasCheckboxOrRadio()) row.selected = !row.selected, $scope.checkboxChange(row, trIndex);
                    if (column.click == undefined && $scope.selectedFlag) {
                        $scope.selectedRow = $scope.selectedRow == undefined || !$scope.autoUnselected || !angular.equals(row, $scope.selectedRow) ? row : undefined;
                    } else if (column.click != undefined) {
                        return column.click(row, columnIndex);
                    }
                };
                $scope.isSelected = function(row) {
                    var ret = $scope.selectRow();
                    if (ret == undefined && $scope.selectedFlag) {
                        return angular.equals(row, $scope.selectedRow);
                    }
                    return ret == undefined ? false : ret;
                };
                $scope.checkboxChange = function(changeRow, trIndex) {
                    if (typeof $scope.table.checkboxChange == 'function') {
                        $scope.table.checkboxChange(changeRow, trIndex);
                    }
                    if ($scope.hasRadio() && changeRow.selected) {
                        angular.forEach($scope.table.data, function(row) {
                            if (!angular.equals(row, changeRow)) {
                                row.selected = false;
                                if (typeof $scope.table.checkboxChange == 'function') {
                                    $scope.table.checkboxChange(row, trIndex);
                                }
                            }
                        });
                    }
                };
                $scope.iconClick = function(column, row, $index) {
                    if (typeof column.iconClick == 'function') {
                        column.iconClick(row, $index);
                    }
                };
                $scope.hasCheckboxOrRadio = function() {
                    return $scope.checkbox == '' || $scope.checkbox == 'true' || $scope.radio == '' || $scope.radio == 'true';
                };
                $scope.hasCheckbox = function() {
                    return $scope.checkbox == '' || $scope.checkbox == 'true';
                };
                $scope.hasRadio = function() {
                    return $scope.radio == '' || $scope.radio == 'true';
                };
                $scope.show = function (column) {
                    if (typeof column.show == 'function') {
                        return column.show();
                    } else if (typeof column.show == 'boolean') {
                        return column.show;
                    }
                    return true;
                };
                $scope.ignoreCount = 0;
                if ($scope.showTableIndex) {
                    $scope.ignoreCount+=1;
                }
                if ($scope.hasCheckboxOrRadio()) {
                    $scope.ignoreCount+=1;
                }
            },
            template:
                "<div>" +
                "   <table class='table table-striped table-hover table-bordered table-vmiddle table-condensed'>" +
                "       <thead>" +
                "           <tr style='font-weight: bold;'>" +
                "               <td ng-if='showTableIndex'>#</td>" +
                "               <td ng-if='hasCheckbox()' class='text-center' ng-click='table.checkAll()' style='cursor: pointer;'>全选</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
                "               <td ng-if='hasRadio()' class='text-center' style='cursor: pointer;'>选择</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
                "              <td ng-repeat='column in table.columns' ng-show='show(column)' class='{{column.class}}'>{{column.title}}</td>" +
                "          </tr>" +
                "       </thead>" +
                "       <tbody>" +
                "           <tr ng-if='table.data == undefined || table.data.length == 0'><td class='text-center tr-no-data' colspan='{{table.columns.length + 1}}'><span>{{table.tip.notFoundRecord}}</span></td></tr>" +
                "           <tr ng-if='table.data.length > 0' class='nl-table-body-tr' ng-repeat='row in table.data' ng-init='rowIndex = $index' data-ng-class=\"{true:'selected'}[isSelected(row)]\">" +
                "               <td ng-if='showTableIndex'>{{$index + 1}}</td>" +
                "               <td ng-if='hasCheckboxOrRadio()' class='text-center'><input type='checkbox' ng-change='checkboxChange(row, $index)' ng-model='row.selected'></td>" +
                "               <td ng-repeat='column in table.columns' class='{{column.class}}' " +
                "                   ng-show='show(column)' " +
                "                   ng-click='tdClick(column, row, $index, rowIndex)'>" +
                "                   <span ng-bind-html='getColumnHtml(column, row)|trustAsHtml'></span> " +
                "                   <i ng-if='column.iconClass != undefined' class='pull-right {{column.iconClass}}' ng-click='iconClick(column, row, $index)'></i>" +
                "               </td>" +
                "           </tr>" +
                "       </tbody>" +
                "       <tfoot ng-if='table.rows > 0 && table.statisticsRow != undefined && table.statisticsRow != {}'>" +
                "           <tr style='background-color: #CCFFFF'><td class='text-center'>统计</td>" +
                "               <td ng-repeat='column in table.columns' ng-if='!($index == 0 && ignoreCount==0)' class='{{column.class}}' " +
                "                   ng-bind-html='getCountColumnHtml(column, table.statisticsRow) | trustAsHtml'></td>" +
                "           </tr>" +
                "       </tfoot>" +
                "   </table>" +
                "</div>",
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
                "<ul class='pagination nl-table-turnpage'>" +
                "   <li><span>一共 {{table.rows}} 条记录，每页 {{table.pageSize}} 条，共 {{table.pageCount}} 页</span></li>" +
                "   <li ng-class='{disabled:(table.pageNo == 1) }'><a ng-click='table.pre()'><span aria-hidden='true'>&laquo;</span></a></li>" +
                "   <li ng-repeat='i in table.pages' ng-class='{active:(i.index == table.pageNo)}'><a ng-click='table.go(i.index)'>{{i.text}}</a></li>" +
                "   <li ng-class='{disabled:(table.pageNo == table.pageCount) }'><a ng-click='table.next()' ><span aria-hidden='true'>&raquo;</span></a></li>" +
                "</ul>",
            replace: true
        };
    })
    .factory("NLListTable", function () {
        return NLListTable;
        /**
         * 初始化
         * @param columns 字段
         * @param callFunction 当页面跳转时触发的方法
         * @param injectParam 拦截的参数
         * @returns {{columns: *, pageSize: number, splitPages: number, pageCount: number, pageNo: number, nextPage: *, prePage: *, tip: {notFoundRecord: string}, go: nltable."go", refresh: nltable."refresh", build: nltable."build", next: nltable."next", pre: nltable."pre", checkAll: nltable.checkAll, getSelected: nltable.getSelected, pages: Array}}
         * @constructor
         */
        function NLListTable(columns, callFunction){
            var nltable = {
                "columns": columns,
                "tip": {
                    "notFoundRecord": "未找到记录"
                },
                "refresh": function() {
                    var t = this;
                    callFunction(function(data) {
                            t.isCheckAll = false;
                            t = angular.extend(t, data);
                            t.build();
                            return t;
                        }
                    );
                },
                "build": function () {
                    callFunction(function (data) {
                        nltable.data = data;
                    });
                },
                checkAll: function() {
                    if (this.data == undefined) return;
                    this.isCheckAll = !this.isCheckAll;
                    angular.forEach(this.data, function(row) {
                        if (row.selected != nltable.isCheckAll && typeof nltable.checkboxChange == 'function') nltable.checkboxChange(row, i+1);
                        row.selected = nltable.isCheckAll;
                    });
                },
                getSelected: function(getDataFun) {
                    var selectedRows = [];
                    angular.forEach(this.data, function(row, index) {
                        if (row.selected) {
                            var d = getDataFun(row, index);
                            if (d != undefined) selectedRows.push(d);
                        }
                    });
                    return selectedRows;
                }
            };
            nltable.build();
            return nltable;
        }
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
            injectParam = injectParam || {};
            var nltable = {
                "columns": columns,
                "pageSize": injectParam.pageSize || 15,
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
                    if (this.data == undefined) return;
                    this.isCheckAll = !this.isCheckAll;
                    angular.forEach(this.data, function(row) {
                        if (row.selected != nltable.isCheckAll && typeof nltable.checkboxChange == 'function') nltable.checkboxChange(row, i+1);
                        row.selected = nltable.isCheckAll;
                    });
                },
                getSelected: function(getDataFun) {
                    var selectedRows = [];
                    angular.forEach(this.data, function(row, index) {
                        if (row.selected) {
                            var d = getDataFun(row, index);
                            if (d != undefined) selectedRows.push(d);
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