//toggleDesc accepts an HTML object that sent a click event and toggles its description
//it then changes the button text appropriately
function toggleDesc(ths) {
    var t = $(ths);
    var n = t.parent().next();
    n.slideToggle();
    if (t.text() == 'Show Description') {
        t.text('Hide Description');
    } else {
        t.text('Show Description');
    }
    ths.preventDefault();
}
//initAccordion should be run whenever new subcategories are added
//it initializes click listeners to expand or collapse the row of associated classes
function initAccordion() {
    $("div.row.class-cat").unbind('click').click(function (e) {
        $(this).next().slideToggle();
        e.preventDefault();
    });
}
//genRandomColor returns a single random color
//we're going for pastel colors to get high contrast
function genRandomColor() {
    //grc is the inverse of the golden ratio
    var grc = 0.618033988749895;
    var h = (Math.random() + grc) % 1;
    var nums = hsvToRGB(h, 0.5, 0.95);
    //don't return something grayish
    if (Math.abs(nums[0] - nums[1]) < 15 || Math.abs(nums[1] - nums[2]) < 15 || Math.abs(nums[0] - nums[1]) < 15) {
        return genRandomColor();
    }
    return '#' + nums[0].toString(16) + nums[1].toString(16) + nums[2].toString(16);
}
//genContrastColors generates maximum-contrast pastel colors
function genContrastColors(colors) {
    /* EXPLAINATION: we convert the RGB colorspace into HSV (cylindrical 
     * coordinates with hue as a theta value as a coefficient of tau). Then we 
     * space everything evenly around an appropriate cross-section of the cylinder
     * to get light pastel colors and map the results back into the RGB colorspace
     */
    var colorArr = []
    for(var i = 0; i < Object.keys(colors).length; i++){
        colorArr.push(i/Object.keys(colors).length)
    }
    function pickRandom(){
        var randInd = Math.floor(Math.random() * colorArr.length);
        var tmp = colorArr[randInd];
        colorArr.splice(randInd, 1);
        return tmp;
    }
    for (var cName in colors) {
        var nums = hsvToRGB(pickRandom(), .5, .95);
        colors[cName] = '#' + nums[0].toString(16) + nums[1].toString(16) + nums[2].toString(16);
    }
}
//convert cylindrical HSV coordinates to RGB coordinates
//credit http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function hsvToRGB(h, s, v) {
    var h_i = Math.floor(h * 6);
    function genRetVals(a, b, c) { return [Math.floor(a * 256), Math.floor(b * 256), Math.floor(c * 256)]; }
    var f = h * 6 - h_i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    if (h_i == 0) return genRetVals(v, t, p);
    if (h_i == 1) return genRetVals(q, v, p);
    if (h_i == 2) return genRetVals(p, v, t);
    if (h_i == 3) return genRetVals(p, q, v);
    if (h_i == 4) return genRetVals(t, p, v);
    return genRetVals(v, p, q);
}
//padLeft method pads a number to the left with either zeroes or a specified
//string to make it a certain length
//credit https://stackoverflow.com/questions/5366849/convert-1-to-0001-in-javascript
Number.prototype.padLeft = function (n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
}
angular.module("poolePrj", [])
    .directive("navbar", function () {
        //this directive cleans up the HTML by moving the navbar into another file
        return {
            type: 'E',
            templateUrl: 'navbar.html'
        };
    })
    .controller('mainCtrl', function ($scope, $http) {
        //activities is the list of selectable activities
        //it starts out blank until the user selects a grade
        this.activities = [];

        //these variables control which "page" the user sees
        this.displayNum = 0;
        //empty string for activity selection page, which has its own titles
        this.displayList = ['', 'Schedule'];

        //dayList is used to convert from numbers to day names
        this.dayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        //colors is a legend of colors used for activities
        this.colors = { 'School': genRandomColor() };

        //numTimes is a configuration for the number of times displayed under each bar
        this.numTimes = 5;

        //ctrlThis is used to modify variables in this's scope when inside another method's scope
        var ctrlThis = this;
        //selectedActivities is the activities the user wants to do
        //it should always contain school
        this.selectedActivities = [{ 'name': 'School', 'times': ['8:10/14:55', '8:10/14:55', '8:10/14:55', '8:10/14:55', '8:10/14:55', '-1:00/0:00', '-1:00/0:00'], superCategory: "" }];
        //schedule is an internal variable with display information, etc
        this.schedule = [[], [], [], [], [], [], []];

        /* minsToTime converts an integer representing a number of minutes to a 
         * string representing the number of hours. If pretty is set to a non-falsy 
         * value, it will return the time in the 12-hour format, otherwise it uses
         * the 24-hour format (ie, 13:00)
         */ 
        function minsToTime(t, pretty) {
            if (!pretty) return Math.floor(t / 60).padLeft(2) + ":" + Math.floor(t % 60).padLeft(2);
            var tmp = Math.floor(t / 60);
            if (tmp > 12) tmp -= 12;
            return tmp.padLeft(2) + ":" + Math.floor(t % 60).padLeft(2);
        }
        //timeToMins accepts a 24-hour formatted time and returns the number
        //of minutes since midnight
        function timeToMins(s) {
            var t = s.split(':');
            return 60 * parseInt(t[0]) + parseInt(t[1]);
        }
        /* dayPortion accepts a number of intervals since the day began at this.timeRanges[0]
         * and returns the corresponding time in the 12-hour format. Interval lengths are
         * defined as the total waking time (this.timeRanges[0]-this.timeRanges[1])
         * divided by the number of intervals (this.numTimes)
         */
        $scope.dayPortion = function (i, start, end) {
            return minsToTime(start + i * (end - start) / (ctrlThis.numTimes - 1), true);
        }
        //toggleSelect either adds or removes a class from the list of selected
        //activities and modifies button styles accordingly
        $scope.toggleSelect = function (act, $event) {
            var tgt = $($event.target);
            var i = ctrlThis.selectedActivities.indexOf(act);
            if (i == -1) {
                ctrlThis.selectedActivities.push(act);
                tgt.text("Remove from Schedule");
                tgt.addClass("remove-button");
                ctrlThis.colors[act.name] = '';
            } else {
                tgt.text("Add to Schedule");
                tgt.removeClass("remove-button");
                delete ctrlThis.colors[act.name];
                ctrlThis.selectedActivities.splice(i, 1);
            }
            genContrastColors(ctrlThis.colors);
            //console.log(ctrlThis.colors);
            regenSchedule();
            $event.preventDefault();
        };
        //changeDisplay simply changes what "page" you're looking at (activity selection or day overview)
        $scope.changeDisplay = function (i) {
            ctrlThis.displayNum = Math.abs(ctrlThis.displayNum + i) % ctrlThis.displayList.length;
            //scroll back to top
            window.scrollTo(0, 0);
        }
        //range is a helper method to allow angular to loop over a range of numbers
        $scope.range = function (min, max, step) {
            step = step || 1;
            var retVal = [];
            for (var i = min; i < max; i += step) {
                retVal.push(i);
            }
            return retVal;
        };
        //weeklyTime sums all an activity's time intervals and returns a total
        //it will return an error if given bad data
        $scope.weeklyTime = function (act) {
            var ttl = 0;
            for (var i = 0; i < act.times.length; i++) {
                var tms = act.times[i].split("/");
                if (tms.length != 2) return "ERROR: BAD TIME DATA";
                if (tms[0] == "-1:00") ttl += timeToMins(tms[1]);
                else ttl += timeToMins(tms[1]) - timeToMins(tms[0]);
            }
            return minsToTime(ttl);
        }
        //regenSchdule loops over each day and generates a schedule for it
        function regenSchedule() {
            for (var i = 0; i < ctrlThis.schedule.length; i++) {
                ctrlThis.schedule[i] = genSchedule(i);
            }
            //the following line can be useful for debugging purposes
            //console.log(ctrlThis.schedule);
        }
        //genSchedule uses the currently selected activities to generate a viable schedule for a given day
        function genSchedule(day) {
            var startMins = 490; //8:10 AM
            var endMins = 1410; //11:30 PM
            for (var i = 0; i < ctrlThis.selectedActivities.length; i++) {
                var t = ctrlThis.selectedActivities[i].times[day].split('/')[0];
                if (t=="-1:00") continue;
                var tmp = timeToMins(t);
                if (tmp < startMins) startMins = tmp;
            }
            //tms is what we'll build on to generate the schedule - we'll pad it first with dummy events to handle edge cases
            var tms = [{ name: "wakeup", offsets: [0, 0], superCategory: "" }, { name: "bedtime", offsets: [endMins, endMins], superCategory: "" }];
            var flexTms = [];
            for (var i = 0; i < ctrlThis.selectedActivities.length; i++) {
                //times contains the start and end times of this activity on this day
                var times = ctrlThis.selectedActivities[i].times[day].split('/');
                if (times[0] == '-1:00') {
                    //if the activity contains a duration, add it in later to give scheduled activities their slots
                    if (times[1] == '0:00' || times[1] == '00:00') continue;
                    flexTms.push({ name: ctrlThis.selectedActivities[i].name, duration: timeToMins(times[1]), superCategory: ctrlThis.selectedActivities[i].superCategory });
                    continue;
                }
                var leftOffset = timeToMins(times[0]) - startMins;
                var rightOffset = timeToMins(times[1]) - startMins;
                //start later to avoid scheduling anything before the day starts
                //the nature of splicing prevents us from scheduling after the day ends
                for (var j = 1; j < tms.length; j++) {
                    if (tms[j - 1].offsets[1] <= leftOffset && tms[j].offsets[0] >= rightOffset) {
                        tms.splice(j, 0, { name: ctrlThis.selectedActivities[i].name, offsets: [leftOffset, rightOffset], superCategory: ctrlThis.selectedActivities[i].superCategory });
                        break;
                    }
                    if ((tms[j - 1].offsets[1] <= leftOffset && tms[j].offsets[0] >= leftOffset) || (tms[j].offsets[0] <= leftOffset && tms[j].offsets[1] >= rightOffset)) {
                        //the schedule is impossible due to conflict between the end of this activity and the start of the next one (TODO)
                        return { err: "Error: Conflict between " + ctrlThis.selectedActivities[i].name + " and " + tms[j].name };
                    }
                    if (tms[j - 1].offsets[1] <= rightOffset && tms[j].offsets[0] >= rightOffset) {
                        //the schedule is impossible due to conflict between the start of this activity and the end of the previous one (TODO)
                        return { err: "Error: Conflict between " + ctrlThis.selectedActivities[i].name + " and " + tms[j - 1].name };
                    }
                }
            }
            //now that we've inserted all firmly scheduled activities, start building in the flexible ones
            for (var i = 1; i < tms.length; i++) {
                if (flexTms.length == 0) break;
                var lastEnded = tms[i - 1].offsets[1];
                var openTime = tms[i].offsets[0] - lastEnded;
                //don't schedule parts of an activity in a period of less than 10 minutes between other activities
                if (openTime < 10) continue;
                if (openTime >= flexTms[0].duration) {
                    tms.splice(i, 0, { name: flexTms[0].name, offsets: [lastEnded, lastEnded + flexTms[0].duration], superCategory: flexTms[0].superCategory });
                    flexTms.shift();
                    continue;
                }
                //openTime can only make a dent in flexTms, so add it in to the schedule and subtract it out from flexTms
                tms.splice(i, 0, { name: flexTms[0].name, offsets: [lastEnded, tms[i].offsets[0]], superCategory: flexTms[0].superCategory });
                flexTms[0].duration -= openTime;
            }
            //if flexTms.length != 0, the schedule is impossible, so throw an error
            if (flexTms.length != 0) {
                return { err: "Error: you don't have enough time in the day for all your activities!" };
            }

            //tms now contains a complete schedule, but we need an object with offsets rescaled to fit the div and empty divs {color, width}
            var retVal = [];
            //90.0 is 90% of the viewscreen width - the width of the day bar's div
            var viewRatio = 90.0 / (endMins - startMins);
            var freeTime = endMins - startMins;

            //create an object representing time consumed and initialize it to contain zeroes
            var consumed = {};
            for (var key in ctrlThis.categories) { consumed[key] = "0:00"; }

            for (var i = 1; i < tms.length; i++) {
                if (tms[i].offsets[0] > tms[i - 1].offsets[1]) {
                    //add in a blank div for padding
                    retVal.push({ color: "white", width: (viewRatio * (tms[i].offsets[0] - tms[i - 1].offsets[1])).toFixed(2).toString() + 'vw' });
                }
                if (i != tms.length - 1) {
                    var taken = tms[i].offsets[1] - tms[i].offsets[0];
                    retVal.push({ name: tms[i].name, width: (viewRatio * (tms[i].offsets[1] - tms[i].offsets[0])).toFixed(2).toString() + 'vw' });
                    if (tms[i].superCategory) consumed[tms[i].superCategory] = minsToTime(timeToMins(consumed[tms[i].superCategory]) + taken);
                    freeTime -= taken;
                }
            }
            return {
                displayBarInfo: retVal,
                "freeTime": Math.floor(freeTime / 60) + " hours, " + freeTime % 60 + " minutes",
                "timeConsumed": consumed,
                start: startMins,
                end: endMins
            };
        };
        $http.get("json/categories.json")
            .then(function (response) {
                ctrlThis.categories = response.data;
            });
        //setGrade accepts a string in the set ['9', '10', '11', '12', 'ALL']
        //it clears downloaded activities and re-downloads them for the specified string's grade
        this.setGrade = function (level) {
            ctrlThis.activities = [];
            $("#dropbtn").text(level);
            $http.get("json/univ.json")
                .then(function (response) {
                    ctrlThis.activities = ctrlThis.activities.concat(response.data.actInfo);
                    initAccordion();
                    //initially get the schedule with only school rendered
                    regenSchedule();
                });
            if (!level) return;
            if (level != 'ALL') {
                $http.get("json/" + level + ".json")
                    .then(function (response) {
                        ctrlThis.activities = ctrlThis.activities.concat(response.data.actInfo);
                        initAccordion();
                        //initially get the schedule with only school rendered
                        regenSchedule();
                    });
                return;
            }
            for (var i = 9; i < 13; i++){
                $http.get("json/" + i + ".json")
                    .then(function (response) {
                        ctrlThis.activities = ctrlThis.activities.concat(response.data.actInfo);
                        initAccordion();
                        //initially get the schedule with only school rendered
                        regenSchedule();
                    });
            }
        }
    });
