/**
 * Created by linchunhui on 15/12/26.
 */
angular.module('nlTables', [])
    .directive('nlTables', function() {
        return {
            restrict: 'A',
            template: "<span style='border: 0px'>" +
            "<table class='table table-striped table-bordered table-hover'><thead><tr><td ng-if='showTableIndex'>#</td><td ng-repeat='column in nltable.columns'>{{column.title}}</td></tr></thead>" +
            "<tbody><tr ng-repeat='row in nltable.data'><td ng-if='showTableIndex'>{{$index + 1}}</td><td ng-repeat='column in nltable.columns' ng-class='[true: '']{column.}' ng-bind-html='column.format ? trustAsHtml(column.format(row[column.name])) : trustAsHtml(row[column.name])'></td></tr></tbody></table>" +
            "<ul class='pagination' style='margin:0px;'><li ng-class='{disabled:(nltable.page == 1) }'><a ng-click='nltable.pre()'><span aria-hidden='true'>&laquo;</span></a></li>" +
            "<li ng-repeat='i in nltable.pages' ng-class='{active:(i.index == nltable.page)}'><a ng-click='nltable.go(i.index)'>{{i.text}}</a></li>" +
            "<li ng-class='{disabled:(nltable.page == nltable.pageCount) }'><a ng-click='nltable.next()' ><span aria-hidden='true'>&raquo;</span></li></a></ul></span>",
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
         * @returns {{columns: *, pageRows: number, splitPages: number, pageCount: number, page: number, nextPage: *, prePage: *, go: scope.nltable."go", build: scope.nltable."build", next: scope.nltable."next", pre: scope.nltable."pre", pages: Array}|*}
         * @constructor
         */
        function NLTables(columns, callFunction, injectParam){
            var nltable = {
                "columns": columns,
                "pageRows": 10,
                "splitPages": 2,
                "pageCount": 0,
                "page": 0,
                "nextPage": injectParam ? injectParam.page || 1 : 1,
                "prePage": injectParam ? injectParam.page || 1 : 1,
                "go": function(page) {
                    //console.log("页码:" + page);
                    if (this.page == page) return;
                    this.page = page;
                    var t = this;
                    if(injectParam){
                        injectParam.page = page;
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
                            t = angular.extend(t, data);
                            t.build();
                        }
                    );
                },
                "build": function() {
                    var pageCount = Math.ceil(this.rows / this.pageRows);
                    this.pageCount = pageCount == 0 ? 1 : pageCount;
                    var p = new Array();
                    this.splitPages = this.splitPages <= 3 ? 3 : this.splitPages;

                    var index = 0;
                    for (var i = 0; i < pageCount; i++) {
                        if (i != 0 && i + 2 <= this.page - this.splitPages) {
                            p[index] = {
                                "index": this.page - this.splitPages * 2 - 1,
                                "text": "……"
                            };
                            i = this.page - this.splitPages - 2;
                        } else if (i == this.page + this.splitPages && i + 1 != this.pageCount) {
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
                    this.nextPage = this.page + 1 > pageCount ? pageCount : this.page + 1;
                    this.prePage = this.page == 1 ? 1 : this.page - 1;
                },
                "next": function(){
                    if (this.page + 1 > this.pageCount) return;
                    this.go(this.page + 1);
                },
                "pre": function() {
                    if (this.page == 1) return;
                    this.go(this.page - 1);
                },
                "pages": []
            };
            nltable.go(injectParam ? injectParam.page || 1 : 1);
            return nltable;
        }
    });