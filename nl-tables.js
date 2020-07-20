/**
 * Created by linchunhui on 15/12/26.
 * Version 3.0.5
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
 *
 * i18n:
 *      目前支持 zh-cn 和 en 两种，默认是:zh-cn， 如果需要其它语种支持，可以通过 app.config进行配置，参考代码如下，也可参考 nl-tables-demo.html：
 *      app.config(["$translateProvider", "$NLTablesProvider", function ($translateProvider, $NLTablesProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });
            $translateProvider.fallbackLanguage('zh-cn');//默认加载语言包
            $translateProvider.use("zh-cn");
            $NLTablesProvider.setI18n({
                'zh-cn': {
                    "checkAll": "全选",
                    "select": "选择",
                    "statistics": "统计",
                    "turnpage_word_1": "一共(这里是测试的)",
                    "turnpage_word_2": "条记录，每页",
                    "turnpage_word_3": "条，共",
                    "turnpage_word_4": "条"
                }});
        }]);
 */
(function (angular) {
    var nlTables = angular.module("module.newland.table", []);
    nlTables.directive("nlTables", function () {
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
            controller: ["$scope", $nlTablesController],
            template:
                "<div>" +
                "   <table class='table table-striped table-hover table-bordered table-vmiddle table-condensed'>" +
                "       <thead>" +
                "           <tr style='font-weight: bold;'>" +
                "               <td ng-if='showTableIndex'>#</td>" +
                "               <td ng-if='hasCheckbox()' class='text-center' ng-click='table.checkAll()' style='cursor: pointer;'>{{'checkAll'|NLTableTranslate}}</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
                "               <td ng-if='hasRadio()' class='text-center' style='cursor: pointer;'>{{ 'select' | NLTableTranslate}}</td>" +  //<input type='checkbox' ng-model='isCheckAll' ng-click='checkAll()'>
                "              <td ng-repeat='column in table.columns' ng-show='show(column)' class='{{column.class}}'>{{column.title ? column.title : (column.translateKey | NLTableTranslate)}}</td>" +
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
                "           <tr style='background-color: #CCFFFF'><td class='text-center'>{{ 'statistics' | NLTableTranslate}}</td>" +
                "               <td ng-repeat='column in table.columns' ng-if='!($index == 0 && ignoreCount==0)' class='{{column.class}}' " +
                "                   ng-bind-html='getCountColumnHtml(column, table.statisticsRow) | trustAsHtml'></td>" +
                "           </tr>" +
                "       </tfoot>" +
                "   </table>" +
                "</div>",
            replace: true
        };
        function $nlTablesController($scope) {
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
        }
    });
    nlTables.filter('trustAsHtml',['$sce',function($sce){
        return function(html){
            if (html == undefined) return "";
            html+='';
            return $sce.trustAsHtml(html);
        }
    }]);
    nlTables.directive("nlTurnPage", $nlTurnPage);
    nlTables.factory("NLListTable", $NLListTable);
    nlTables.factory("NLTables", $NLTablesFactory);
    nlTables.provider("$NLTables", function abcProvider() {
        this.setI18n = function (conf) {
            angular.extend(this.translateJson, conf);
        };
        this.translateJson = {'zh-cn': {
                "checkAll": "全选",
                "select": "选择",
                "statistics": "统计",
                "turnpage_word_1": "共",
                "turnpage_word_2": "行, ",
                "turnpage_word_4": "页"
            }, 'en': {
                "checkAll": "ALL",
                "select": "Select",
                "statistics": "Statistics",
                "turnpage_word_1": "Total of ",
                "turnpage_word_2": " rows, ",
                "turnpage_word_4": " pages"
            }
        };
        this.$get = function(){
            return this;
        }
    });
    nlTables.filter("NLTableTranslate", ["$NLTables", "$injector", function ($NLTables, $injector) {
        var $translate = $injector.has("$translate") ? $translate = $injector.get("$translate") : undefined;
        var fun = function (tag) {
            var lang = $translate ? $translate.use() || "zh-cn"  : "zh-cn";
            var obj = $NLTables.translateJson[lang];
            if (obj == undefined) return translateInstant(tag);
            var value = obj[tag];
            if (value != undefined) return value;
            return translateInstant(tag);
        };
        function translateInstant(tag) {return $translate ? $translate.instant(tag) : tag;}
        fun.$stateful = true;
        return fun;
    }]);
    function $nlTurnPage() {
        return {
            restrict: 'EA',
            scope: {
                table: "="
            },
            template:
                "<ul class='pagination nl-table-turnpage'>" +
                "   <li><span>{{ 'turnpage_word_1' | NLTableTranslate}} {{table.rows}} {{ 'turnpage_word_2' | NLTableTranslate}} {{table.pageCount}} {{ 'turnpage_word_4' | NLTableTranslate}}</span></li>" +
                "   <li ng-class='{disabled:(table.pageNo == 1) }'><a ng-click='table.pre()'><span aria-hidden='true'>&laquo;</span></a></li>" +
                "   <li ng-repeat='i in table.pages' ng-class='{active:(i.index == table.pageNo)}'><a ng-click='table.go(i.index)'>{{i.text}}</a></li>" +
                "   <li ng-class='{disabled:(table.pageNo == table.pageCount) }'><a ng-click='table.next()' ><span aria-hidden='true'>&raquo;</span></a></li>" +
                "</ul>",
            replace: true
        }
    }
    function $NLListTable() {
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
    }
    function $NLTablesFactory() {
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
    }
})(angular);