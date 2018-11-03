"use strict";

const hostPrefix = "host:";

function categorize (tags) {
    return tags.split(" ").reduce(function (categorized, tag) {
        if (tag) {
            if (tag.indexOf(hostPrefix) === 0) {
                categorized.hosts.push(tag.substr(hostPrefix.length));
            } else if (tag.charAt(0) === "-") {
                categorized.excluded.push(tag.substr(1));
            } else {
                categorized.features.push(tag);
            }
        }
        return categorized;
    }, {
        hosts: [],
        features: [],
        excluded: []
    });
}

function intersect (array1, array2) {
    return array1.some(function (value1) {
        return array2.indexOf(value1) !== -1;
    });
}

function includeCore (tags) {
    return tags.features.indexOf("core") !== -1;
}

function includeFeature (tags, requested) {
    if (tags.features.length && requested.features.length) {
        return intersect(tags.features, requested.features);
    }
}

function includeHost (tags, requested) {
    if (tags.hosts.length && requested.hosts.length) {
        return intersect(tags.hosts, requested.hosts);
    }
}

function includeRequestedSources (sources, requested) {
    return sources.map(function (source) {
        if (requested.excluded.indexOf(source.name) !== -1) {
            return false;
        }
        var tags = categorize(source.tags || ""),
            shouldIncludeFeature,
            shouldIncludeHost;
        // core tags are always included
        if (includeCore(tags)) {
            return true;
        }
        shouldIncludeFeature = includeFeature(tags, requested);
        // Featured sources that are not explicitely requested are discarded
        if (shouldIncludeFeature === false) {
            return shouldIncludeFeature;
        }
        // Process host relevant sources
        shouldIncludeHost = includeHost(tags, requested);
        if (undefined !== shouldIncludeHost) {
            return shouldIncludeHost;
        }
        return shouldIncludeFeature;
    });
}

function getSourceIndex (sources, name) {
    var result;
    sources.every(function (source, index) {
        if (name === source.name) {
            result = index;
            return false;
        }
        return true;
    });
    return result;
}

function getFlavor (sources, dependencies, request) {
    var requested = categorize(request),
        // Initial is based on tags
        allowed = includeRequestedSources(sources, requested),
        index = sources.length,
        features = [].concat(requested.features),
        featureSetChanged = false;
    function allow (dependency) {
        if (requested.excluded.indexOf(dependency) !== -1) {
            return;
        }
        var sourceIndex = getSourceIndex(sources, dependency),
            tags = categorize(sources[sourceIndex].tags || "");
        // Process dependant features
        tags.features.forEach(function (feature) {
            if (features.indexOf(feature) === -1) {
                features.push(feature);
                featureSetChanged = true;
            }
        });
        allowed[sourceIndex] = true;
    }
    while (--index > 0) {
        if (!allowed[index]) {
            continue;
        }
        // var before = features.length;
        (dependencies[sources[index].name] || []).forEach(allow);
        // if (features.length !== before) {
        //     console.log(sources[index].name + ": " + features.slice(before));
        // }
    }
    if (featureSetChanged) {
        return getFlavor(sources, dependencies, features.join(" ") + " " + request);
    }
    return allowed;
}

module.exports = getFlavor;
