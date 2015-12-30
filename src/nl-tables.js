/**
 * Created by linchunhui on 15/12/26.
 */
angular.module('nlTables', [])
    .directive('nlTables', function() {
        return {
            restrict: 'A',
            template: "<span style='border: 0px'>" +
                "<table class='table table-striped table-bordered table-hover'><thead><tr><td ng-if='showTableIndex'>#</td><td ng-repeat='column in nltable.columns'>{{column.title}}</td></tr></thead>" +
                "<tbody><tr ng-repeat='row in nltable.data'><td ng-if='showTableIndex'>{{$index + 1}}</td><td ng-repeat='column in nltable.columns'>{{row[column.name]}}</td></tr></tbody></table>" +
                "<ul class='pagination' style='margin:0px;'><li ng-class='{disabled:(nltable.page == 1) }'><a ng-click='nltable.pre()'><span aria-hidden='true'>&laquo;</span></a></li>" +
                "<li ng-repeat='i in nltable.pages' ng-class='{active:(i.index == nltable.page)}'><a ng-click='nltable.go(i.index)'>{{i.text}}</a></li>" +
                "<li ng-class='{disabled:(nltable.page == nltable.pageCount) }'><a ng-click='nltable.next()' ><span aria-hidden='true'>&raquo;</span></li></a></ul></span>",
            replace: true
        };
    })
    .factory("NLTables", function() {
        return function(scope, columns, callFunction, injectParam){
            scope.nltable = {
                "columns": columns,
                "pageRows": 10,
                "splitPages": 2,
                "pageCount": 0,
                "page": 0,
                "nextPage": injectParam.page || 1,
                "prePage": injectParam.page || 1,
                "go": function(page) {
                    if (this.page == page) return;
                    this.page = page;
                    callFunction(injectParam || {},
                        function(data) {
                            console.log(data);
                            scope.nltable = angular.extend(scope.nltable, data);
                            scope.nltable.build();
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
                    console.log(this);
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
            scope.nltable.go(injectParam.page || 1);
            return scope.nltable;
        }
    });