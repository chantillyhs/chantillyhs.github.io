// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();
//angular.module("jsonEdt");

angular.module("editor", [])
    .controller('mainCtrl', function ($scope) {
        //these variables control which "page" the user sees
        this.displayNum = 0;
        //empty string for JSON display page, which has its own titles
        this.displayList = ['Paste Current JSON', 'Edit Classes', ''];

        //the classes we're editing
        this.classModel = { actInfo: [] };

        this.outText = "";

        this.newAct = {
            name: "", description: "", superCategory: "", category: "",
            times: [
                "-1:00/0:00",
                "-1:00/0:00",
                "-1:00/0:00",
                "-1:00/0:00",
                "-1:00/0:00",
                "-1:00/0:00",
                "-1:00/0:00"
            ]
        };

        $scope.rmItem = function (act) {
            var ind = ctrlThis.classModel.actInfo.indexOf(act);
            if (ind == -1) {
                alert("Error: can't remove class if not in array");
                return;
            }
            ctrlThis.classModel.actInfo.splice(ind, 1);
        };

        $scope.addItem = function () {
            ctrlThis.classModel.actInfo.unshift(ctrlThis.newAct);
            ctrlThis.newAct = {
                name: "", description: "", superCategory: "", category: "",
                times: [
                    "-1:00/0:00",
                    "-1:00/0:00",
                    "-1:00/0:00",
                    "-1:00/0:00",
                    "-1:00/0:00",
                    "-1:00/0:00",
                    "-1:00/0:00"
                ]
            };
        };

        $scope.displayDesc = function(e){
            $(e.target).parent().parent().next().slideToggle();
        }

        $scope.displayTimes = function(e){
            $(e.target).parent().parent().next().next().slideToggle();
        }

        var ctrlThis = this;
        $scope.changeDisplay = function (i) {
            if (ctrlThis.displayNum + i < 0 || ctrlThis.displayNum > ctrlThis.displayList.length - 1) return;
            ctrlThis.displayNum += i;
            if (ctrlThis.displayNum == 1 && i == 1) {
                //parse JSON string and write to classModel.actInfo
                ctrlThis.classModel = JSON.parse($("#jsonInBox").val());
            } else if (ctrlThis.displayNum == 2) {
                ctrlThis.outText = angular.toJson(ctrlThis.classModel, true);
            }
            window.scrollTo(0, 0);
        }
        $scope.range = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i < max; i += step) {
                input.push(i);
            }
            return input;
        };

    });
