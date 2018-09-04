gpf.require.define({
    releases: "../../build/releases.json"

}, function (require) {
    "use strict";

    function zero (value) {
        if (value < 9) {
            return "0" + value;
        }
        return value;
    }

    function showDate (value) {
        var date = new Date(value);
        return date.getFullYear() + "-" + date.getMonth();
    }

    function buildGetter (path) {
        return new Function("release", "return release." + path);
    }

    return {

        series: function (definitions) {
            new Chartist.Line(".charts", {
                series: Object.keys(definitions).reduce(function (series, name) {
                    var getter = buildGetter(definitions[name]);
                    series.push({
                        name: name,
                        data: require.releases.map(function (release) {
                            return {
                                x: new Date(release.date),
                                y: getter(release)
                            };
                        })
                    });
                    return series;
                }, [])
            }, {
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    divisor: 5,
                    labelInterpolationFnc: showDate
                },
                axisY: {
                    onlyInteger: true
                }
            });
        }

    };

});
